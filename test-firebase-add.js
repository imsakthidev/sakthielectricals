import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPam0NaBtOhyI2KyZwE6e9Yv33CK99SNM",
  authDomain: "sakthielectricals-ceff7.firebaseapp.com",
  projectId: "sakthielectricals-ceff7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const newItem = { id: 100, name: "Test Product", price: 50, photo: "" };
  await setDoc(doc(db, "items", "100"), newItem);
  console.log("Added item!");
  process.exit(0);
}
test();
