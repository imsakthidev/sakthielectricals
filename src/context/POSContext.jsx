import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const POSContext = createContext();

export const usePOS = () => useContext(POSContext);

const defaultItems = [
  { id: 1, name: "LED Bulb 9W", price: 80, photo: "" },
  { id: 2, name: "Insulation Tape", price: 15, photo: "" },
  { id: 3, name: "Copper Wire 1.5mm", price: 900, photo: "" },
  { id: 4, name: "Modular Switch 6A", price: 35, photo: "" }
];

export const POSProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [bills, setBills] = useState([]);
  const [deletedBills, setDeletedBills] = useState([]);
  const [appPin, setAppPin] = useState('1234');
  const [appPattern, setAppPattern] = useState([0, 1, 2, 4, 6, 7, 8]);
  const [savedQR, setSavedQR] = useState('');
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync with Firebase
  useEffect(() => {
    let unsubItems, unsubBills, unsubDeleted, unsubSettings;

    const initFirebase = async () => {
      try {
        unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
          if (snapshot.empty && items.length === 0) {
            // Seed default items if empty
            defaultItems.forEach(item => {
              setDoc(doc(db, "items", item.id.toString()), item);
            });
          } else {
            const fetchedItems = snapshot.docs.map(doc => doc.data());
            setItems(fetchedItems);
          }
        });

        unsubBills = onSnapshot(collection(db, "bills"), (snapshot) => {
          setBills(snapshot.docs.map(doc => doc.data()).sort((a,b) => a.id - b.id));
        });

        unsubDeleted = onSnapshot(collection(db, "deletedBills"), (snapshot) => {
          setDeletedBills(snapshot.docs.map(doc => doc.data()).sort((a,b) => a.id - b.id));
        });

        unsubSettings = onSnapshot(doc(db, "settings", "appSettings"), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.appPin) setAppPin(data.appPin);
            if (data.appPattern) setAppPattern(data.appPattern);
            if (data.savedQR !== undefined) setSavedQR(data.savedQR);
          } else {
            // Migrate settings if appSettings doesn't exist
            const localPin = localStorage.getItem('sakthi_elec_pin');
            const localPattern = localStorage.getItem('sakthi_elec_pattern');
            const localQR = localStorage.getItem('sakthi_elec_qr');
            setDoc(doc(db, "settings", "appSettings"), {
              appPin: localPin || '1234',
              appPattern: localPattern ? JSON.parse(localPattern) : [0, 1, 2, 4, 6, 7, 8],
              savedQR: localQR || ''
            });
          }
        });

        // Migrate Old Local Storage Bills & Items
        const localBills = localStorage.getItem('sakthi_elec_bills');
        if (localBills) {
          const parsedBills = JSON.parse(localBills);
          parsedBills.forEach(bill => setDoc(doc(db, "bills", bill.id.toString()), bill));
          localStorage.removeItem('sakthi_elec_bills');
        }

        const localDeletedBills = localStorage.getItem('sakthi_elec_deleted_bills');
        if (localDeletedBills) {
          const parsedDeletedBills = JSON.parse(localDeletedBills);
          parsedDeletedBills.forEach(bill => setDoc(doc(db, "deletedBills", bill.id.toString()), bill));
          localStorage.removeItem('sakthi_elec_deleted_bills');
        }

        const localItems = localStorage.getItem('sakthi_elec_items');
        if (localItems) {
          const parsedItems = JSON.parse(localItems);
          parsedItems.forEach(item => setDoc(doc(db, "items", item.id.toString()), item));
          localStorage.removeItem('sakthi_elec_items');
        }

        setLoading(false);
      } catch (error) {
        console.error("Firebase connection error. Ensure your firebaseConfig is correct.", error);
        setLoading(false);
      }
    };

    initFirebase();

    return () => {
      if (unsubItems) unsubItems();
      if (unsubBills) unsubBills();
      if (unsubDeleted) unsubDeleted();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  const updateSettings = async (updates) => {
    try {
      await setDoc(doc(db, "settings", "appSettings"), updates, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetAppPin = (pin) => {
    setAppPin(pin);
    updateSettings({ appPin: pin });
  };

  const handleSetAppPattern = (pattern) => {
    setAppPattern(pattern);
    updateSettings({ appPattern: pattern });
  };

  const handleSetSavedQR = (qr) => {
    setSavedQR(qr);
    updateSettings({ savedQR: qr });
  };

  const updateQty = (id, change) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + change;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const clearCart = () => setCart({});

  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = items.find(i => i.id === parseInt(id) || i.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const confirmPayment = async () => {
    if (Object.keys(cart).length === 0) return null;
    const billItems = Object.entries(cart).map(([id, qty]) => {
      const item = items.find(i => i.id === parseInt(id) || i.id === id);
      return `${item?.name || 'Unknown'} x${qty}`;
    });
    
    const newBill = {
      id: Date.now(),
      date: new Date().toISOString(),
      summary: billItems.join(', '),
      total: cartTotal
    };
    
    // Optimistic UI update
    setBills(prev => [...prev, newBill]);
    clearCart();

    try {
      await setDoc(doc(db, "bills", newBill.id.toString()), newBill);
    } catch (e) {
      console.error("Error saving bill:", e);
    }
    return newBill;
  };

  const moveToBin = async (id) => {
    const billToMove = bills.find(b => b.id === id);
    if (billToMove) {
      setBills(prev => prev.filter(b => b.id !== id));
      setDeletedBills(prev => [...prev, billToMove]);
      try {
        await deleteDoc(doc(db, "bills", id.toString()));
        await setDoc(doc(db, "deletedBills", id.toString()), billToMove);
      } catch (e) { console.error(e); }
    }
  };

  const restoreFromBin = async (id) => {
    const billToRestore = deletedBills.find(b => b.id === id);
    if (billToRestore) {
      setDeletedBills(prev => prev.filter(b => b.id !== id));
      setBills(prev => [...prev, billToRestore]);
      try {
        await deleteDoc(doc(db, "deletedBills", id.toString()));
        await setDoc(doc(db, "bills", id.toString()), billToRestore);
      } catch (e) { console.error(e); }
    }
  };

  const deletePermanently = async (id) => {
    setDeletedBills(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, "deletedBills", id.toString()));
    } catch (e) { console.error(e); }
  };

  const addItem = async (item) => {
    setItems(prev => [...prev, item]);
    try {
      await setDoc(doc(db, "items", item.id.toString()), item);
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, "items", id.toString()));
    } catch (e) { console.error(e); }
  };
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: 'white' }}>Connecting to Cloud...</div>;
  }

  return (
    <POSContext.Provider value={{
      items, addItem, deleteItem,
      bills, setBills,
      deletedBills, moveToBin, restoreFromBin, deletePermanently,
      appPin, setAppPin: handleSetAppPin,
      appPattern, setAppPattern: handleSetAppPattern,
      savedQR, setSavedQR: handleSetSavedQR,
      cart, updateQty, clearCart, cartTotal, confirmPayment
    }}>
      {children}
    </POSContext.Provider>
  );
};
