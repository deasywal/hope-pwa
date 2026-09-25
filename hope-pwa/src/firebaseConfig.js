import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBJwyq9zt92PspVxTYvqJKgYGL3OzWB89Q", 
  authDomain: "hope-pwa.firebaseapp.com", 
  projectId: "hope-pwa", 
  storageBucket: "hope-pwa.firebasestorage.app", 
  messagingSenderId: "63818839044", 
  appId: "1:63818839044:web:72f220040cf94f16c97151" 
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); 

export { db };
