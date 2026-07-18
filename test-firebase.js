import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPam0NaBtOhyI2KyZwE6e9Yv33CK99SNM",
  authDomain: "sakthielectricals-ceff7.firebaseapp.com",
  projectId: "sakthielectricals-ceff7",
  storageBucket: "sakthielectricals-ceff7.firebasestorage.app",
  messagingSenderId: "142607909505",
  appId: "1:142607909505:web:1fef9e595563478029c380"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Testing write...");
    await setDoc(doc(db, "test", "testdoc"), { hello: "world" });
    console.log("Write successful!");
    
    console.log("Testing read...");
    const snap = await getDocs(collection(db, "bills"));
    console.log("Read successful! Found " + snap.docs.length + " bills.");
    snap.docs.forEach(d => console.log(d.id, d.data()));
  } catch (e) {
    console.error("Firebase error:", e);
  }
  process.exit(0);
}

test();
