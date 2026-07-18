import React, { createContext, useContext, useState, useEffect } from 'react';

const POSContext = createContext();

export const usePOS = () => useContext(POSContext);

const defaultItems = [
  { id: 1, name: "LED Bulb 9W", price: 80, photo: "" },
  { id: 2, name: "Insulation Tape", price: 15, photo: "" },
  { id: 3, name: "Copper Wire 1.5mm", price: 900, photo: "" },
  { id: 4, name: "Modular Switch 6A", price: 35, photo: "" }
];

export const POSProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('sakthi_elec_items');
    return saved ? JSON.parse(saved) : defaultItems;
  });
  
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('sakthi_elec_bills');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [deletedBills, setDeletedBills] = useState(() => {
    const saved = localStorage.getItem('sakthi_elec_deleted_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [appPin, setAppPin] = useState(() => {
    return localStorage.getItem('sakthi_elec_pin') || '1234';
  });
  
  const [appPattern, setAppPattern] = useState(() => {
    const saved = localStorage.getItem('sakthi_elec_pattern');
    return saved ? JSON.parse(saved) : [0, 1, 2, 4, 6, 7, 8];
  });
  
  const [savedQR, setSavedQR] = useState(() => {
    return localStorage.getItem('sakthi_elec_qr') || '';
  });
  
  const [cart, setCart] = useState({});

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('sakthi_elec_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('sakthi_elec_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('sakthi_elec_deleted_bills', JSON.stringify(deletedBills)); }, [deletedBills]);
  useEffect(() => { localStorage.setItem('sakthi_elec_pin', appPin); }, [appPin]);
  useEffect(() => { localStorage.setItem('sakthi_elec_pattern', JSON.stringify(appPattern)); }, [appPattern]);
  useEffect(() => { localStorage.setItem('sakthi_elec_qr', savedQR); }, [savedQR]);

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
    const item = items.find(i => i.id === parseInt(id));
    return total + (item ? item.price * qty : 0);
  }, 0);

  const confirmPayment = () => {
    if (Object.keys(cart).length === 0) return null;
    const billItems = Object.entries(cart).map(([id, qty]) => {
      const item = items.find(i => i.id === parseInt(id));
      return `${item.name} x${qty}`;
    });
    
    const newBill = {
      id: Date.now(),
      date: new Date().toISOString(),
      summary: billItems.join(', '),
      total: cartTotal
    };
    
    setBills(prev => [...prev, newBill]);
    clearCart();
    return newBill.id;
  };

  const moveToBin = (id) => {
    const billToMove = bills.find(b => b.id === id);
    if (billToMove) {
      setBills(prev => prev.filter(b => b.id !== id));
      setDeletedBills(prev => [...prev, billToMove]);
    }
  };

  const restoreFromBin = (id) => {
    const billToRestore = deletedBills.find(b => b.id === id);
    if (billToRestore) {
      setDeletedBills(prev => prev.filter(b => b.id !== id));
      setBills(prev => [...prev, billToRestore]);
    }
  };

  const deletePermanently = (id) => {
    setDeletedBills(prev => prev.filter(b => b.id !== id));
  };

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };
  
  return (
    <POSContext.Provider value={{
      items, addItem, deleteItem,
      bills, setBills,
      deletedBills, moveToBin, restoreFromBin, deletePermanently,
      appPin, setAppPin,
      appPattern, setAppPattern,
      savedQR, setSavedQR,
      cart, updateQty, clearCart, cartTotal, confirmPayment
    }}>
      {children}
    </POSContext.Provider>
  );
};
