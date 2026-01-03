import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const NotesManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Dummy Data for Notes
  const [notes, setNotes] = useState([
    { id: '1', title: 'Data Structure Basics', semester: '3rd', subject: 'CSE', lectureNo: '01', date: 'Jan 02, 2026' },
    { id: '2', title: 'Algorithm Analysis', semester: '3rd', subject: 'CSE', lectureNo: '05', date: 'Jan 01, 2026' },
  ]);

  // Function to pick PDF
  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const renderNoteItem = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteInfo}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#059669" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteSub}>Lec: {item.lectureNo} • {item.subject} • {item.semester} Sem</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editBtn}><MaterialIcons name="edit" size={20} color="#4F46E5" /></TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn}><MaterialIcons name="delete" size={20} color="#EF4444" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Lecture Notes</Text>
          <Text style={styles.headerSub}>{notes.length} lectures uploaded</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Note Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload New Lecture</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Lecture Title</Text>
              <TextInput style={styles.input} placeholder="e.g. Intro to Linked List" />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Lecture No.</Text>
                  <TextInput style={styles.input} placeholder="01" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Semester</Text>
                  <TextInput style={styles.input} placeholder="3rd" />
                </View>
              </View>

              <Text style={styles.label}>Subject</Text>
              <TextInput style={styles.input} placeholder="Computer Science" />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 70 }]} multiline placeholder="Optional details..." />

              {/* PDF Picker Button */}
              <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                <MaterialCommunityIcons name="file-pdf-box" size={32} color={selectedFile ? "#059669" : "#4F46E5"} />
                <Text style={[styles.uploadText, selectedFile && {color: '#059669'}]}>
                  {selectedFile ? selectedFile.name : "Select Lecture PDF"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Upload Note</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 14, color: '#6B7280' },
  
  addButton: { backgroundColor: '#4F46E5', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },

  noteCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03 },
  noteInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 45, height: 45, backgroundColor: '#ECFDF5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  noteSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },

  actionButtons: { flexDirection: 'row' },
  editBtn: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 8, marginRight: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 10 },
  row: { flexDirection: 'row' },
  
  uploadBox: { marginTop: 20, padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 15, alignItems: 'center' },
  uploadText: { marginTop: 8, color: '#4F46E5', fontWeight: '600', textAlign: 'center' },
  
  saveButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25, marginBottom: 30 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default NotesManagement;