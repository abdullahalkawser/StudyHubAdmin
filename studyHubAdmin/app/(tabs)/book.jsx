import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { uploadFile } from "../../upload";
import { addDocument } from "../../firestore";

export default function BooksScreen() {
  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ফাইল সিলেক্ট করার ফাংশন
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick the file.");
    }
  };

  // আপলোড হ্যান্ডেলার
  const handleUpload = async () => {
    if (!file || !title || !semester || !subject) {
      Alert.alert("Missing Fields", "Please fill all fields and select a PDF.");
      return;
    }

    setLoading(true); // লোডিং শুরু
    try {
      const fileUrl = await uploadFile(file, "books");
      
      if (!fileUrl) {
        throw new Error("File upload failed to storage.");
      }

      await addDocument("books", { 
        title, 
        semester, 
        subject, 
        fileUrl, 
        createdAt: new Date().toISOString() 
      });

      // সফল হলে মেসেজ
      Alert.alert("Success 🎉", "The book has been uploaded and saved successfully!");
      
      // ফরম ক্লিয়ার করা
      setTitle(""); 
      setSemester(""); 
      setSubject(""); 
      setFile(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed ❌", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); // লোডিং শেষ
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Add New Book</Text>
        <Text style={styles.headerSub}>Fill the details to upload a new resource</Text>
      </View>

      <View style={styles.formCard}>
        {/* Title Input */}
        <Text style={styles.label}>Book Title</Text>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="title" size={20} color="#64748B" />
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="e.g. Advanced Mathematics" 
            style={styles.input} 
          />
        </View>

        {/* Semester & Subject Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Semester</Text>
            <TextInput 
              value={semester} 
              onChangeText={setSemester} 
              placeholder="e.g. 3rd" 
              style={styles.inputSmall} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Subject</Text>
            <TextInput 
              value={subject} 
              onChangeText={setSubject} 
              placeholder="Math" 
              style={styles.inputSmall} 
            />
          </View>
        </View>

        {/* File Picker Section */}
        <Text style={styles.label}>Attachment</Text>
        <TouchableOpacity 
          style={[styles.uploadBox, file && styles.uploadBoxActive]} 
          onPress={pickFile}
        >
          <FontAwesome5 
            name={file ? "file-pdf" : "cloud-upload-alt"} 
            size={30} 
            color={file ? "#E11D48" : "#4F46E5"} 
          />
          <Text style={[styles.uploadText, file && { color: "#1E293B" }]}>
            {file ? file.name : "Select PDF Document"}
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="cloud-done" size={22} color="white" />
              <Text style={styles.btnText}>Upload & Publish</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F8FAFC", padding: 20 },
  headerSection: { marginTop: 40, marginBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#1E293B" },
  headerSub: { fontSize: 14, color: "#64748B", marginTop: 5 },

  formCard: { 
    backgroundColor: "#fff", 
    borderRadius: 25, 
    padding: 20, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOpacity: 0.05, 
    shadowRadius: 15 
  },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8, marginTop: 15 },
  
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F1F5F9", 
    borderRadius: 12, 
    paddingHorizontal: 12 
  },
  input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15 },
  
  row: { flexDirection: "row", marginTop: 5 },
  inputSmall: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12, fontSize: 15 },

  uploadBox: { 
    marginTop: 10, 
    padding: 25, 
    borderStyle: "dashed", 
    borderWidth: 2, 
    borderColor: "#CBD5E1", 
    borderRadius: 15, 
    alignItems: "center", 
    backgroundColor: "#F8FAFC" 
  },
  uploadBoxActive: { borderColor: "#4F46E5", backgroundColor: "#EEF2FF" },
  uploadText: { marginTop: 10, color: "#64748B", fontWeight: "500" },

  btn: { 
    backgroundColor: "#4F46E5", 
    padding: 16, 
    borderRadius: 15, 
    alignItems: "center", 
    marginTop: 30,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnDisabled: { opacity: 0.7 },
  btnContent: { flexDirection: "row", alignItems: "center" },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
});