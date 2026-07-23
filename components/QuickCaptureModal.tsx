import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaptureType } from './QuickCaptureFAB';
import { saveNote, saveTask, saveEvent, saveBudgetItem } from '../services/database';

interface QuickCaptureModalProps {
  visible: boolean;
  type: CaptureType | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  visible,
  type,
  onClose,
  onRefresh,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = async () => {
    if (!title.trim() && type !== 'budget') return;
    const now = Date.now();

    if (type === 'note' || type === 'voice' || type === 'photo') {
      await saveNote({
        id: 'note_' + now,
        title: title || (type === 'voice' ? 'Voice Memory' : 'Captured Photo'),
        content: content || title,
        createdAt: now,
        updatedAt: now,
      });
    } else if (type === 'task') {
      await saveTask({
        id: 'task_' + now,
        title,
        dueDate: new Date(now + 86400000).toISOString().split('T')[0],
        isCompleted: false,
        priority,
        category,
        createdAt: now,
      });
    } else if (type === 'event') {
      await saveEvent({
        id: 'evt_' + now,
        title,
        startDate: new Date(now).toISOString().split('T')[0] + ' 10:00',
        createdAt: now,
      });
    } else if (type === 'budget') {
      await saveBudgetItem({
        id: 'bgt_' + now,
        type: 'expense',
        amount: parseFloat(amount) || 0,
        category: category || 'Expense',
        note: title,
        timestamp: now,
      });
    }

    setTitle('');
    setContent('');
    setAmount('');
    onRefresh();
    onClose();
  };

  if (!type) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Capture {type.toUpperCase()}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {type === 'budget' ? (
            <>
              <Text style={styles.label}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Food, Groceries, Shopping..."
                value={category}
                onChangeText={setCategory}
              />
              <Text style={styles.label}>Note / Description</Text>
              <TextInput
                style={styles.input}
                placeholder="What was this for?"
                value={title}
                onChangeText={setTitle}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${type} title...`}
                value={title}
                onChangeText={setTitle}
              />

              {(type === 'note' || type === 'voice' || type === 'photo') && (
                <>
                  <Text style={styles.label}>Content / Details</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Write markdown note, details, or transcript..."
                    multiline
                    value={content}
                    onChangeText={setContent}
                  />
                </>
              )}

              {type === 'task' && (
                <View style={styles.priorityRow}>
                  <Text style={styles.label}>Priority:</Text>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pPill, priority === p && styles.pPillActive]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[styles.pText, priority === p && styles.pTextActive]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Memory to ZIURY</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginLeft: 8,
  },
  pPillActive: {
    backgroundColor: '#6366f1',
  },
  pText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  pTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
