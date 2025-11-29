import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKkIgYyPqGNirX_K4DFklYh-I_HvHKCFg",
  authDomain: "legaltechsolution-3f4e5.firebaseapp.com",
  projectId: "legaltechsolution-3f4e5",
  storageBucket: "legaltechsolution-3f4e5.firebasestorage.app",
  messagingSenderId: "287309577955",
  appId: "1:287309577955:web:d024203b05be9b01580fd6",
  measurementId: "G-88RRSP2L7E"
};

let app;
let auth: any;
let googleProvider: any;

if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase config missing. Firebase features will not work.");
}

export { auth, googleProvider };
