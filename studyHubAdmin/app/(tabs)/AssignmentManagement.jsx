import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../FirebaseConfig';

const AssignmentManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'assignments'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      Alert.alert("Error", "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!title || !subject || !dueDate) {
      Alert.alert("Required", "Please provide Title, Subject, and Due Date.");
      return;
    }

    setLoading(true);
    try {
      const payload = { title, subject, dueDate, description };
      if (editingId) {
        await updateDoc(doc(db, 'assignments', editingId), payload);
        setAssignments(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a));
        Alert.alert("Updated", "Assignment changes saved!");
      } else {
        const docRef = await addDoc(collection(db, 'assignments'), { ...payload, createdAt: new Date() });
        setAssignments(prev => [{ id: docRef.id, ...payload }, ...prev]);
        Alert.alert("Success", "New assignment posted!");
      }
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Operation failed!");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setTitle('');
    setSubject('');
    setDueDate('');
    setDescription('');
    setEditingId(null);
    setModalVisible(false);
  };

  const handleEdit = (assignment) => {
    setTitle(assignment.title);
    setSubject(assignment.subject);
    setDueDate(assignment.dueDate);
    setDescription(assignment.description);
    setEditingId(assignment.id);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Task",
      "Are you sure you want to delete this assignment forever?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'assignments', id));
              setAssignments(prev => prev.filter(a => a.id !== id));
            } catch (error) {
              Alert.alert("Error", "Could not delete.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <FontAwesome5 name="book-open" size={10} color="#6366F1" />
            <Text style={styles.subjectText}>{item.subject.toUpperCase()}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Feather name="clock" size={12} color="#EF4444" />
            <Text style={styles.dateText}>{item.dueDate}</Text>
          </View>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descText} numberOfLines={2}>{item.description || "No additional details provided."}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
            <Feather name="edit-3" size={16} color="#4F46E5" />
            <Text style={styles.editBtnLabel}>Edit Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* APP BAR */}
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.mainTitle}>Assignments</Text>
          <Text style={styles.subTitle}>Track student coursework</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* CONTENT LIST */}
      {loading && assignments.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5 name="tasks" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No active assignments found</Text>
            </View>
          }
        />
      )}

      {/* CREATION MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalHeading}>{editingId ? "Modify Task" : "Add Task"}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Assignment Title</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="e.g. Final Lab Report" 
                value={title} 
                onChangeText={setTitle} 
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.fieldLabel}>Subject</Text>
                  <TextInput 
                    style={styles.textInput} 
                    placeholder="e.g. Physics" 
                    value={subject} 
                    onChangeText={setSubject} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Due Date</Text>
                  <TextInput 
                    style={styles.textInput} 
                    placeholder="10 Jan" 
                    value={dueDate} 
                    onChangeText={setDueDate} 
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Task Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Include instructions, links, etc."
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity 
                style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]} 
                onPress={handleSaveAssignment}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>{editingId ? "Save Changes" : "Post Assignment"}</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  headerArea: { 
    paddingTop: 60, 
    paddingHorizontal: 25, 
    paddingBottom: 25, 
    backgroundColor: '#FFF',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mainTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  subTitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  fab: { 
    backgroundColor: '#4F46E5', 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },

  // List & Cards
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    marginBottom: 16, 
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardAccent: { width: 8, backgroundColor: '#6366F1' },
  cardBody: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  subjectText: { fontSize: 10, fontWeight: '800', color: '#6366F1', marginLeft: 6 },
  dateBadge: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, fontWeight: '700', color: '#EF4444', marginLeft: 5 },
  titleText: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  descText: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 18 },
  
  cardActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9', 
    paddingTop: 15 
  },
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F3FF', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12,
    marginRight: 10
  },
  editBtnLabel: { color: '#4F46E5', fontWeight: '700', fontSize: 13, marginLeft: 6 },
  deleteBtn: { backgroundColor: '#FFF1F2', padding: 8, borderRadius: 12 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalSheet: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    paddingHorizontal: 28, 
    paddingTop: 12,
    maxHeight: '85%' 
  },
  dragHandle: { width: 38, height: 4, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalHeading: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  closeBtn: { backgroundColor: '#F8FAFC', padding: 8, borderRadius: 12 },
  
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  textInput: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    padding: 16, 
    borderRadius: 18, 
    fontSize: 16, 
    color: '#1E293B',
    marginBottom: 18
  },
  row: { flexDirection: 'row' },
  textArea: { height: 110, textAlignVertical: 'top' },
  primaryBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10
  },
  primaryBtnText: { color: 'white', fontSize: 17, fontWeight: '800' },
  emptyBox: { alignItems: 'center', marginTop: 120, opacity: 0.5 },
  emptyText: { color: '#64748B', marginTop: 15, fontSize: 16, fontWeight: '500' }
});

export default AssignmentManagement;