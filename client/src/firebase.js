// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-449a3.firebaseapp.com",
  projectId: "mern-estate-449a3",
  storageBucket: "mern-estate-449a3.firebasestorage.app",
  messagingSenderId: "691107158908",
  appId: "1:691107158908:web:7af895400c94f57730e2f9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);