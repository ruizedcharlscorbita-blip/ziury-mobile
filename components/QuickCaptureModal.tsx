import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveNote: (title: string, content: string) => Promise<void>;
  onSaveTask: (title: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  onSaveBudget: (type: 'income' | 'expense', amount: number, category: string) => Promise<void>;
}

type CaptureType = 'note' | 'task' | 'budget';

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  visible,
  onClose,
  onSaveNote,
  onSaveTask,
  onSaveBudget,
}) => {
  const [activeType, setActiveType] = useState<CaptureType>('note');
  
  // Note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Budget fields
  const [budgetType, setBudgetType] = useState<'income' | 'expense'>('expense');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');

  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setTaskTitle('');
    setTaskPriority('medium');
    setBudgetType('expense');
    setBudgetAmount('');
    setBudgetCategory('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeType === 'note') {
        if (!noteTitle.trim()) return;
        await onSaveNote(noteTitle.trim(), noteContent.trim());
      } else if (activeType === 'task') {
        if (!taskTitle.trim()) return;
        await onSaveTask(taskTitle.trim(), taskPriority);
      } else if (activeType === 'budget') {
        const amt = parseFloat(budgetAmount);
        if (isNaN(amt) || amt <= 0) return;
        await onSaveBudget(budgetType, amt, budgetCategory.trim() || 'General');
      }
      resetForm();
      onClose();
    } catch (err) {
      console.warn('Error saving quick capture item:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="flash" size={20} color="#6366f1" />
              <Text style={styles.title}>Quick Capture</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Type Selector Tabs */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeBtn, activeType === 'note' && styles.typeBtnActive]}
              onPress={() => setActiveType('note')}
            >
              <Ionicons
                name="document-text"
                size={16}
                color={activeType === 'note' ? '#6366f1' : '#6b7280'}
              />
              <Text style={[styles.typeText, activeType === 'note' && styles.typeTextActive]}>
                Note
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, activeType === 'task' && styles.typeBtnActive]}
              onPress={() => setActiveType('task')}
            >
              <Ionicons
                name="checkbox"
                size={16}
                color={activeType === 'task' ? '#10b981' : '#6b7280'}
              />
              <Text style={[styles.typeText, activeType === 'task' && styles.typeTextActive]}>
                Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, activeType === 'budget' && styles.typeBtnActive]}
              onPress={() => setActiveType('budget')}
            >
              <Ionicons
                name="wallet"
                size={16}
                color={activeType === 'budget' ? '#06b6d4' : '#6b7280'}
              />
              <Text style={[styles.typeText, activeType === 'budget' && styles.typeTextActive]}>
                Budget
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Form Body */}
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {activeType === 'note' && (
              <View>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Note Title..."
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
                <Text style={styles.inputLabel}>Content</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your note content here..."
                  multiline
                  numberOfLines={4}
                  value={noteContent}
                  onChangeText={setNoteContent}
                />
              </View>
            )}

            {activeType === 'task' && (
              <View>
                <Text style={styles.inputLabel}>Task Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What needs to be done?"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityBadge,
                        taskPriority === p && styles.priorityBadgeActive,
                      ]}
                      onPress={() => setTaskPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          taskPriority === p && styles.priorityTextActive,
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {activeType === 'budget' && (
              <View>
                <Text style={styles.inputLabel}>Transaction Type</Text>
                <View style={styles.priorityRow}>
                  <TouchableOpacity
                    style={[
                      styles.priorityBadge,
                      budgetType === 'expense' && styles.priorityBadgeActive,
                    ]}
                    onPress={() => setBudgetType('expense')}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        budgetType === 'expense' && styles.priorityTextActive,
                      ]}
                    >
                      EXPENSE
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityBadge,
                      budgetType === 'income' && styles.priorityBadgeActive,
                    ]}
                    onPress={() => setBudgetType('income')}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        budgetType === 'income' && styles.priorityTextActive,
                      ]}
                    >
                      INCOME
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Groceries, Salary, Coffee"
                  value={budgetCategory}
                  onChangeText={setBudgetCategory}
                />
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving...' : 'Save Quick Item'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  typeTextActive: {
    color: '#111827',
  },
  body: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
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
    height: 90,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: '#f9fafb',
  },
  priorityBadgeActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  priorityTextActive: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
