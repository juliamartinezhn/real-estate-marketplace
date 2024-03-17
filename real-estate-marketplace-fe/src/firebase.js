// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-85424.firebaseapp.com",
  projectId: "mern-estate-85424",
  storageBucket: "mern-estate-85424.appspot.com",
  messagingSenderId: "123096748838",
  appId: "1:123096748838:web:e2025a6301a2d7ca42e7e7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);