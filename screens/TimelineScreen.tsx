import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimelineItem } from '../types';

interface TimelineScreenProps {
  items: TimelineItem[];
  onSaveItem?: (item: TimelineItem) => Promise<void>;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ items, onSaveItem }) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.summary.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'note':
        return 'document-text-outline';
      case 'task':
        return 'checkbox-outline';
      case 'event':
        return 'calendar-outline';
      case 'voice':
        return 'mic-outline';
      case 'photo':
        return 'camera-outline';
      default:
        return 'sparkles-outline';
    }
  };

  const openEditModal = (item: TimelineItem) => {
    setSelectedItem(item);
    setTitleInput(item.title);
    setSummaryInput(item.summary);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedItem || !titleInput.trim()) return;

    const updated: TimelineItem = {
      ...selectedItem,
      title: titleInput.trim(),
      summary: summaryInput.trim(),
    };

    if (onSaveItem) {
      await onSaveItem(updated);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Timeline</Text>
        <Text style={styles.subtitle}>
          "Capture everything. Remember forever."
        </Text>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your life memories..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const icon = getTypeIcon(item.type);
          const dateStr = new Date(item.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.timelineRow}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.timeColumn}>
                <Text style={styles.dateText}>{dateStr}</Text>
                <Text style={styles.timeText}>{timeStr}</Text>
              </View>

              <View style={styles.lineIndicator}>
                <View style={styles.iconCircle}>
                  <Ionicons name={icon} size={14} color="#ffffff" />
                </View>
                <View style={styles.verticalLine} />
              </View>

              <View style={styles.card}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSummary}>{item.summary}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Timeline is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Notes, tasks, and memories captured will appear here.
            </Text>
          </View>
        }
      />

      {/* Edit Memory Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Life Memory</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={titleInput}
              onChangeText={setTitleInput}
            />

            <Text style={styles.label}>Memory Details / Summary</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={summaryInput}
              onChangeText={setSummaryInput}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Update Memory</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  timeText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  lineIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemSummary: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6366f1',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
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
    lineHeight: 18,
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
    marginBottom: 14,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
