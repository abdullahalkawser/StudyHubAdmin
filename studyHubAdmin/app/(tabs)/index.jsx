import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Book, FileText, Edit3, Bell, ChevronRight } from 'lucide-react-native';
import { db } from '../../FirebaseConfig'; // path check করো
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    books: 0,
    notes: 0,
    assignments: 0,
    notices: 0,
  });

  const [recentUploads, setRecentUploads] = useState([]);
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Collections
      const booksSnap = await getDocs(collection(db, 'books'));
      const notesSnap = await getDocs(collection(db, 'notes'));
      const assignmentsSnap = await getDocs(collection(db, 'assignments'));
      const noticesSnap = await getDocs(collection(db, 'notices'));

      // Set stats
      setStats({
        books: booksSnap.size,
        notes: notesSnap.size,
        assignments: assignmentsSnap.size,
        notices: noticesSnap.size,
      });

      // Combine recent uploads from all collections
      const allDocs = [
        ...booksSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Book', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...notesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Note', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...assignmentsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Assignment', createdAt: doc.data().createdAt?.toDate() || new Date() })),
        ...noticesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name, type: 'Notice', createdAt: doc.data().createdAt?.toDate() || new Date() })),
      ];

      // Sort by newest first
      allDocs.sort((a, b) => b.createdAt - a.createdAt);
      setRecentUploads(allDocs.slice(0, 5)); // latest 5 uploads
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { id: 1, title: 'Total Books', count: stats.books, icon: <Book size={24} color="#4F46E5" />, bg: '#EEF2FF' },
    { id: 2, title: 'Notes', count: stats.notes, icon: <FileText size={24} color="#059669" />, bg: '#ECFDF5' },
    { id: 3, title: 'Assignments', count: stats.assignments, icon: <Edit3 size={24} color="#D97706" />, bg: '#FFFBEB' },
    { id: 4, title: 'Notices', count: stats.notices, icon: <Bell size={24} color="#DC2626" />, bg: '#FEF2F2' },
  ];

  const renderStatCard = ({ item }) => (
    <View style={[styles.statCard, { backgroundColor: item.bg }]}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <Text style={styles.statCount}>{item.count}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back,</Text>
        <Text style={styles.userName}>Dashboard Overview</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 30 }} />
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.grid}>
            {statItems.map(item => (
              <View key={item.id} style={styles.gridItem}>
                {renderStatCard({ item })}
              </View>
            ))}
          </View>

          {/* Recent Uploads Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {recentUploads.map(item => (
              <TouchableOpacity key={item.id} style={styles.uploadItem}>
                <View style={styles.uploadIconCircle}>
                  <FileText size={20} color="#6B7280" />
                </View>
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadName}>{item.name}</Text>
                  <Text style={styles.uploadDate}>{item.type} • {item.createdAt.toLocaleDateString()}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 30 },
  header: { marginTop: 50, marginBottom: 25 },
  welcomeText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#111827' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 15 },
  statCard: { padding: 20, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  iconContainer: { marginBottom: 12 },
  statCount: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statTitle: { fontSize: 14, color: '#4B5563', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  viewAll: { color: '#4F46E5', fontWeight: '600' },

  recentList: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 10, marginBottom: 30 },
  uploadItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  uploadIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  uploadInfo: { flex: 1, marginLeft: 15 },
  uploadName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  uploadDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});

export default Dashboard;
