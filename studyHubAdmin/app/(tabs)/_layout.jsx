import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // ভেক্টর আইকন ইমপোর্ট করুন
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#FFF' : '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 70, // প্ল্যাটফর্ম অনুযায়ী হাইট
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 15,
          position: 'absolute', // ভাসমান লুক দেওয়ার জন্য
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        }
      }}>
      
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* Notice */}
      <Tabs.Screen
        name="notice"
        options={{
          title: 'Notice',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "megaphone" : "megaphone-outline"} size={24} color={focused ? '#EA580C' : '#94A3B8'} />
          ),
        }}
      />

      {/* Books */}
      <Tabs.Screen
        name="book"
        options={{
          title: 'Books',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={24} color={focused ? '#E11D48' : '#94A3B8'} />
          ),
        }}
      />

      {/* Notes */}
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name={focused ? "note-text" : "note-text-outline"} size={24} color={focused ? '#059669' : '#94A3B8'} />
          ),
        }}
      />

      {/* Exam (Routine) */}
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Exam',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={focused ? '#D97706' : '#94A3B8'} />
          ),
        }}
      />

      {/* Assignment */}
      <Tabs.Screen
        name="AssignmentManagement"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={24} color={focused ? '#7C3AED' : '#94A3B8'} />
          ),
        }}
      />
    </Tabs>
  );
}