import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Modal, TextInput, ScrollView, Alert, ActivityIndicator, 
  StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { db } from '../../FirebaseConfig'; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const ExamRoutine = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [semester, setSemester] = useState('');
  const [room, setRoom] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const examsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(examsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      Alert.alert("Error", "Failed to fetch exam schedules!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!subject || !date || !time || !semester) {
      Alert.alert("Required", "Please fill in Subject, Date, Time, and Semester.");
      return;
    }

    setLoading(true);
    try {
      const payload = { subject, date, time, semester, room };
      if (editingId) {
        await updateDoc(doc(db, 'exams', editingId), payload);
        setExams(prev => prev.map(e => e.id === editingId ? { ...e, ...payload } : e));
        Alert.alert("Updated", "Exam routine updated!");
      } else {
        const docRef = await addDoc(collection(db, 'exams'), { ...payload, createdAt: new Date() });
        setExams(prev => [{ id: docRef.id, ...payload }, ...prev]);
        Alert.alert("Success", "Exam scheduled successfully!");
      }
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Action failed!");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSubject('');
    setDate('');
    setTime('');
    setSemester('');
    setRoom('');
    setEditingId(null);
    setModalVisible(false);
  };

  const handleEdit = (exam) => {
    setSubject(exam.subject);
    setDate(exam.date);
    setTime(exam.time);
    setSemester(exam.semester);
    setRoom(exam.room);
    setEditingId(exam.id);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Exam",
      "Are you sure you want to delete this schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'exams', id));
              setExams(prev => prev.filter(e => e.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderExamItem = ({ item }) => {
    // Splits "20 Jan 2026" into parts for the UI
    const dateParts = item.date.split(' ');
    const day = dateParts[0] || '??';
    const month = dateParts[1] || 'DAY';

    return (
      <View style={styles.examCard}>
        <View style={styles.dateSide}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month.substring(0, 3).toUpperCase()}</Text>
        </View>

        <View style={styles.contentSide}>
          <View style={styles.cardTopRow}>
            <Text style={styles.semesterTag}>{item.semester} Semester</Text>
            <View style={styles.timeBadge}>
              <Feather name="clock" size={12} color="#4F46E5" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
          
          <Text style={styles.subjectTitle}>{item.subject}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#6366F1" />
            <Text style={styles.locationText}>Room: {item.room || 'TBA'}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
              <Feather name="edit-2" size={16} color="#4F46E5" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(item.id)}>
              <Feather name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.headerTitle}>Exam Routine</Text>
          <Text style={styles.headerSub}>Manage your schedules</Text>
        </View>
        <TouchableOpacity style={styles.addCircle} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {loading && exams.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          renderItem={renderExamItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="calendar-check" size={50} color="#D1D5DB" />
              <Text style={styles.emptyText}>No exams scheduled yet</Text>
            </View>
          }
        />
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.dragBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Schedule" : "Add Exam"}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 30 }}>
              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput 
                style={styles.modernInput} 
                placeholder="e.g. Data Structures" 
                value={subject} 
                onChangeText={setSubject} 
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1.2, marginRight: 12 }}>
                  <Text style={styles.inputLabel}>Exam Date</Text>
                  <TextInput 
                    style={styles.modernInput} 
                    placeholder="25 Jan 2026" 
                    value={date} 
                    onChangeText={setDate} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput 
                    style={styles.modernInput} 
                    placeholder="02:00 PM" 
                    value={time} 
                    onChangeText={setTime} 
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.inputLabel}>Semester</Text>
                  <TextInput 
                    style={styles.modernInput} 
                    placeholder="4th" 
                    value={semester} 
                    onChangeText={setSemester} 
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.inputLabel}>Room No.</Text>
                  <TextInput 
                    style={styles.modernInput} 
                    placeholder="Lab 01" 
                    value={room} 
                    onChangeText={setRoom} 
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveActionBtn, { opacity: loading ? 0.8 : 1 }]} 
                onPress={handleSaveExam}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveActionText}>{editingId ? "Update Schedule" : "Save Schedule"}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  mainHeader: { 
    paddingTop: 60, 
    paddingHorizontal: 25, 
    paddingBottom: 25, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  addCircle: { 
    backgroundColor: '#4F46E5', 
    width: 55, 
    height: 55, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },

  // Cards
  listContainer: { padding: 20, paddingBottom: 100 },
  examCard: { 
    backgroundColor: 'white', 
    borderRadius: 25, 
    marginBottom: 16, 
    flexDirection: 'row', 
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  dateSide: { 
    backgroundColor: '#4F46E5', 
    width: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10 
  },
  dateDay: { fontSize: 26, fontWeight: '900', color: 'white' },
  dateMonth: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: -2 },
  
  contentSide: { flex: 1, padding: 18 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  semesterTag: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 11, color: '#4F46E5', fontWeight: 'bold', marginLeft: 4 },
  subjectTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginLeft: 5 },

  cardActions: { flexDirection: 'row', position: 'absolute', bottom: 15, right: 15 },
  iconBtn: { backgroundColor: '#EEF2FF', padding: 10, borderRadius: 12, marginLeft: 10 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    paddingHorizontal: 25, 
    maxHeight: '85%' 
  },
  dragBar: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginVertical: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  closeBtn: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 15 },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 },
  modernInput: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 16, 
    borderRadius: 16, 
    fontSize: 16, 
    color: '#1F2937',
    marginBottom: 20
  },
  inputRow: { flexDirection: 'row' },
  saveActionBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  saveActionText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { color: '#6B7280', fontSize: 16, fontWeight: '600', marginTop: 15 }
});

export default ExamRoutine;