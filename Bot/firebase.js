const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  onSnapshot, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  setDoc
} = require('firebase/firestore');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { 
  db, 
  auth,
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  onSnapshot, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};