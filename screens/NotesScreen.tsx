import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';

interface NotesScreenProps {
  notes: Note[];
  onSaveNote: (note: Note) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingNote(null);
    setTitleInput('');
    setContentInput('');
    setTagInput('General');
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitleInput(note.title);
    setContentInput(note.content);
    setTagInput(note.tags && note.tags.length > 0 ? note.tags.join(', ') : 'General');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return;

    const now = Date.now();
    const tagsArr = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const noteToSave: Note = {
      id: editingNote ? editingNote.id : 'note_' + now,
      title: titleInput.trim(),
      content: contentInput.trim(),
      tags: tagsArr.length > 0 ? tagsArr : ['General'],
      createdAt: editingNote ? editingNote.createdAt : now,
      updatedAt: now,
    };

    await onSaveNote(noteToSave);
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (editingNote && onDeleteNote) {
      await onDeleteNote(editingNote.id);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notes & Memories</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes & transcripts..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.noteContent} numberOfLines={4}>
              {item.content}
            </Text>
            <Text style={styles.noteDate}>
              {new Date(item.updatedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Notes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button above to capture a new note.
            </Text>
          </View>
        }
      />

      {/* Interactive Note Editor Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Note' : 'New Memory Note'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Note Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter note title..."
                value={titleInput}
                onChangeText={setTitleInput}
              />

              <Text style={styles.label}>Content / Markdown</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your note content here..."
                multiline
                numberOfLines={6}
                value={contentInput}
                onChangeText={setContentInput}
              />

              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Work, Ideas, Meeting"
                value={tagInput}
                onChangeText={setTagInput}
              />

              <View style={styles.actionRow}>
                {editingNote && onDeleteNote && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  noteCard: {
    width: '48%',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    flex: 1,
  },
  noteDate: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    width: '100%',
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
    maxHeight: '85%',
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
  modalBody: {
    marginBottom: 10,
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
    height: 120,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    marginRight: 10,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
