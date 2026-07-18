import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPam0NaBtOhyI2KyZwE6e9Yv33CK99SNM",
  authDomain: "sakthielectricals-ceff7.firebaseapp.com",
  projectId: "sakthielectricals-ceff7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const snap = await getDocs(collection(db, "items"));
  snap.docs.forEach(d => console.log(d.id, d.data().name));
  process.exit(0);
}
test();
