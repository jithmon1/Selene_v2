// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAgZgd2vssqJE7obM6nq_IYvtcZOOkBnws",
  authDomain: "selene-7575f.firebaseapp.com",
  projectId: "selene-7575f",
  storageBucket: "selene-7575f.firebasestorage.app",
  messagingSenderId: "102407778654",
  appId: "1:102407778654:web:dcb03d567c64c63f105fcf"
};

// Initialize Firebase
export const FIREBASE_APP  = initializeApp(firebaseConfig);
export const FIREBASE_AUTH  = getAuth(FIREBASE_APP);
export const  FIRESTORE_DB= getFirestore(FIREBASE_APP);
