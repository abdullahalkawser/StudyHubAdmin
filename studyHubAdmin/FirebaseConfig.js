import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgAkqxd07NiNoBQftllS0S8wW_09RGnkM",
  authDomain: "bubtcsehub.firebaseapp.com",
  projectId: "bubtcsehub",
  storageBucket: "bubtcsehub.firebasestorage.app",
  messagingSenderId: "811459734674",
  appId: "1:811459734674:web:15195a0f5a43629ab38a4b"
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
