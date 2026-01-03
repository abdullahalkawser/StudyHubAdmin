import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Book, FileText, Edit3, Bell } from 'lucide-react-native';
import { db } from '../../FirebaseConfig'; // Firebase path check
import { collection, getDocs } from 'firebase/firestore';

const AllUploadsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [allUploads, setAllUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAllUploads();
  }, []);

  const fetchAllUploads = async () => {
    setLoading(true);
    try {
      const booksSnap = await getDocs(collection(db, 'books'));
      const notesSnap = await getDocs(collection(db, 'notes'));
      const assignmentsSnap = await getDocs(collection(db, 'assignments'));
      const noticesSnap = await getDocs(collection(db, 'notices'));

      const combined = [
        ...booksSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Book', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...notesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Note', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...assignmentsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Assignment', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...noticesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Notice', createdAt: doc.data().createdAt?.toDate() || new Date() })),
      ];

      combined.sort((a, b) => b.createdAt - a.createdAt);

      setAllUploads(combined);
      setFilteredUploads(combined);
    } catch (error) {
      console.log("Fetch all uploads error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = allUploads.filter(item => item.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredUploads(filtered);
  };

  const renderUploadIcon = (type) => {
    switch(type) {
      case 'Book': return <Book size={20} color="#4F46E5" />;
      case 'Note': return <FileText size={20} color="#059669" />;
      case 'Assignment': return <Edit3 size={20} color="#D97706" />;
      case 'Notice': return <Bell size={20} color="#DC2626" />;
      default: return <FileText size={20} color="#6B7280" />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.uploadItem}>
      <View style={styles.uploadIconCircle}>
        {renderUploadIcon(item.type)}
      </View>
      <View style={styles.uploadInfo}>
        <Text style={styles.uploadName}>{item.name}</Text>
        <Text style={styles.uploadDate}>{item.type} • {item.createdAt.toLocaleDateString()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search uploads..."
        value={searchText}
        onChangeText={handleSearch}
      />
      {filteredUploads.length === 0 ? (
        <View style={{ marginTop: 50, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>No uploads found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUploads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 20 },
  searchInput: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 15 },
  uploadItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  uploadIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  uploadInfo: { flex: 1, marginLeft: 15 },
  uploadName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  uploadDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});

export default AllUploadsScreen;
