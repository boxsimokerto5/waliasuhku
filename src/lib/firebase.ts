import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCrEuSB1OVS6Kzrc5xBJLjxqVlcNCXlH1Y",
  authDomain: "inlaid-park-8d2jw.firebaseapp.com",
  projectId: "inlaid-park-8d2jw",
  storageBucket: "inlaid-park-8d2jw.firebasestorage.app",
  messagingSenderId: "75023398519",
  appId: "1:75023398519:web:67144c8c030fa0967eb872"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID
const db = getFirestore(app, "ai-studio-waliasuhku-5b4d6e99-725b-48c6-9756-310ee01109f2");

export { app, db };
