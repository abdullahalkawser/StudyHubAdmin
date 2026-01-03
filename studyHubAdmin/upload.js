import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./FirebaseConfig";

export const uploadFile = async (file, folder) => {
  try {
    if (!file?.uri) throw new Error("Invalid file");

    // 1. Fetch file uri → Blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // 2. Safe file name
    const fileName = file.name.replace(/\s/g, "_");

    // 3. Storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // 4. Upload
    await uploadBytes(storageRef, blob);

    // 5. Get download URL
    const url = await getDownloadURL(storageRef);
    console.log("Upload success:", url);
    return url;

  } catch (error) {
    console.error("File upload error:", error);
    return null;
  }
};
