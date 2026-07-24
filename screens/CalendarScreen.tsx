import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '../types';

interface CalendarScreenProps {
  events: CalendarEvent[];
  onRefresh: () => Promise<void>;
  onSaveEvent: (event: CalendarEvent) => Promise<void>;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  events,
  onRefresh,
  onSaveEvent,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [locationInput, setLocationInput] = useState('');

  const handlePullRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return;

    const newEvt: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: titleInput.trim(),
      startDate: dateInput.trim(),
      location: locationInput.trim() || undefined,
      createdAt: Date.now(),
    };

    await onSaveEvent(newEvt);
    setTitleInput('');
    setLocationInput('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Calendar & Events</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Integrated Schedule • Google Calendar Sync Ready</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            colors={['#6366f1']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{item.startDate}</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.location && (
                <Text style={styles.eventLocation}>📍 {item.location}</Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Events Scheduled</Text>
            <Text style={styles.emptySubtitle}>
              Pull down to refresh from Google Calendar or tap + to add a custom event.
            </Text>
          </View>
        }
      />

      {/* New Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Meeting / Event Title"
              value={titleInput}
              onChangeText={setTitleInput}
            />

            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateInput}
              onChangeText={setDateInput}
            />

            <Text style={styles.label}>Location / Link (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Google Meet, Room A"
              value={locationInput}
              onChangeText={setLocationInput}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  timeBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  eventLocation: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
