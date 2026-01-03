import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Modal, TextInput, ScrollView, Alert, ActivityIndicator, 
  StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons, Ionicons, Octicons, Feather } from '@expo/vector-icons';
import { db } from '../../FirebaseConfig'; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const NoticeManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'notices'));
      const noticesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotices(noticesData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      Alert.alert("Error", "Failed to fetch notices!");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastNotice = async () => {
    if (!title || !description || !date) {
      Alert.alert("Required", "Please fill in all fields to proceed.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'notices', editingId), { title, desc: description, date });
        setNotices(prev => prev.map(n => n.id === editingId ? { ...n, title, desc: description, date } : n));
        Alert.alert("Success", "Notice updated!");
      } else {
        const docRef = await addDoc(collection(db, 'notices'), { title, desc: description, date, createdAt: new Date() });
        setNotices(prev => [{ id: docRef.id, title, desc: description, date }, ...prev]);
        Alert.alert("Success", "Notice published!");
      }
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Action failed!");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingId(null);
    setModalVisible(false);
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setDescription(notice.desc);
    setDate(notice.date);
    setEditingId(notice.id);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Notice",
      "This action cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'notices', id));
              setNotices(prev => prev.filter(n => n.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderNoticeItem = ({ item }) => (
    <View style={styles.noticeCard}>
      <View style={styles.cardHighlight} />
      <View style={styles.cardContent}>
        <View style={styles.noticeHeader}>
          <View style={styles.titleWrapper}>
            <View style={styles.statusDot} />
            <Text style={styles.noticeTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Feather name="calendar" size={10} color="#6366F1" />
            <Text style={styles.noticeDate}>{item.date}</Text>
          </View>
        </View>
        
        <Text style={styles.noticeDesc} numberOfLines={3}>{item.desc}</Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={[styles.miniBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
            <MaterialIcons name="edit" size={16} color="#4F46E5" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.miniBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
            <MaterialIcons name="delete-sweep" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bulletin Board</Text>
          <Text style={styles.headerSub}>Manage campus announcements</Text>
        </View>
        <TouchableOpacity style={styles.fabAdd} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading && notices.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={renderNoticeItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={50} color="#D1D5DB" />
              <Text style={styles.emptyText}>No notices posted yet</Text>
            </View>
          }
        />
      )}

      {/* MODERN MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Update Notice" : "Create Notice"}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeCircle}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Headline</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="Notice title..."
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Content Details</Text>
              <TextInput
                style={[styles.modernInput, styles.textArea]}
                placeholder="Describe the announcement..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>Display Date</Text>
              <View style={styles.dateInputWrapper}>
                <Feather name="calendar" size={18} color="#6366F1" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.flexInput}
                  placeholder="e.g. Oct 12, 2025"
                  placeholderTextColor="#9CA3AF"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <TouchableOpacity 
                style={[styles.mainActionBtn, { opacity: loading ? 0.7 : 1 }]} 
                onPress={handleBroadcastNotice}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.mainActionBtnText}>
                      {editingId ? "Save Changes" : "Post Announcement"}
                    </Text>
                    <Feather name="send" size={18} color="white" style={{ marginLeft: 8 }} />
                  </>
                )}
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
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 25, 
    paddingBottom: 20, 
    backgroundColor: '#FFF',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  fabAdd: { 
    backgroundColor: '#6366F1', 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }
  },

  listPadding: { padding: 20, paddingBottom: 100 },
  noticeCard: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    marginBottom: 16, 
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHighlight: { width: 6, backgroundColor: '#6366F1' },
  cardContent: { flex: 1, padding: 20 },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  noticeTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  dateBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  noticeDate: { fontSize: 11, color: '#6366F1', fontWeight: 'bold', marginLeft: 4 },
  noticeDesc: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  miniBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10 },
  editBtn: { backgroundColor: '#F5F3FF', marginRight: 10, paddingHorizontal: 12 },
  editText: { color: '#4F46E5', fontWeight: '700', fontSize: 13, marginLeft: 4 },
  deleteBtn: { backgroundColor: '#FEF2F2' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    paddingHorizontal: 25, 
    paddingTop: 15,
    maxHeight: '90%' 
  },
  modalIndicator: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  closeCircle: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 20 },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 },
  modernInput: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 15, 
    borderRadius: 16, 
    fontSize: 16, 
    color: '#1F2937',
    marginBottom: 20
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  dateInputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 16, 
    paddingHorizontal: 15,
    marginBottom: 25
  },
  flexInput: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#1F2937' },
  
  mainActionBtn: { 
    backgroundColor: '#6366F1', 
    padding: 18, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5
  },
  mainActionBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16 }
});

export default NoticeManagement;