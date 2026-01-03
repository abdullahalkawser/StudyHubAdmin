import { collection, addDoc } from "firebase/firestore";
import { db } from "./FirebaseConfig";

export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log(`${collectionName} added with ID:`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.log("Firestore add error:", error);
    return null;
  }
};
