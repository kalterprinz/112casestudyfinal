// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAEDPWkha_aQXOvYArRIuNlrQSDsa-9jY",
  authDomain: "casestudy-42864.firebaseapp.com",
  projectId: "casestudy-42864",
  storageBucket: "casestudy-42864.firebasestorage.app",
  messagingSenderId: "698713899691",
  appId: "1:698713899691:web:25dc08a1b6a0e0765d2dee",
  measurementId: "G-10JMF9S3SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };