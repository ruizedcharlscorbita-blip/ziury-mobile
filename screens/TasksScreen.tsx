import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { saveTask } from '../services/database';

interface TasksScreenProps {
  tasks: Task[];
  onRefresh: () => void;
  onSaveTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onRefresh,
  onSaveTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };


  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [titleInput, setTitleInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDateInput, setDueDateInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');

  const filteredTasks = tasks.filter((t) =>
    filter === 'pending' ? !t.isCompleted : t.isCompleted
  );

  const openCreateModal = () => {
    const defaultDueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setEditingTask(null);
    setTitleInput('');
    setPriorityInput('medium');
    setDueDateInput(defaultDueDate);
    setCategoryInput('General');
    setIsModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitleInput(task.title);
    setPriorityInput(task.priority);
    setDueDateInput(task.dueDate || '');
    setCategoryInput(task.category || 'General');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const toggleTask = async (task: Task) => {
    await saveTask({ ...task, isCompleted: !task.isCompleted });
    onRefresh();
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return;

    const now = Date.now();
    const taskToSave: Task = {
      id: editingTask ? editingTask.id : 'task_' + now,
      title: titleInput.trim(),
      priority: priorityInput,
      dueDate: dueDateInput.trim() || undefined,
      category: categoryInput.trim() || 'General',
      isCompleted: editingTask ? editingTask.isCompleted : false,
      createdAt: editingTask ? editingTask.createdAt : now,
    };

    await onSaveTask(taskToSave);
    closeModal();
  };

  const handleDelete = async () => {
    if (editingTask) {
      await onDeleteTask(editingTask.id);
      closeModal();
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return { bg: '#fef2f2', text: '#ef4444' };
      case 'low':
        return { bg: '#f0fdf4', text: '#16a34a' };
      default:
        return { bg: '#eef2ff', text: '#6366f1' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tasks & Todos</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, filter === 'pending' && styles.tabActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.tabText, filter === 'pending' && styles.tabTextActive]}>
              Pending ({tasks.filter((t) => !t.isCompleted).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, filter === 'completed' && styles.tabActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.tabText, filter === 'completed' && styles.tabTextActive]}>
              Completed ({tasks.filter((t) => t.isCompleted).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            colors={['#6366f1']}
          />
        }
        renderItem={({ item }) => {
          const priorityBadgeStyle = getPriorityColor(item.priority);
          return (
            <View style={styles.taskCard}>
              <TouchableOpacity
                style={styles.checkboxTouch}
                onPress={() => toggleTask(item)}
              >
                <Ionicons
                  name={item.isCompleted ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.isCompleted ? '#10b981' : '#6366f1'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskTextContainer}
                onPress={() => openEditModal(item)}
              >
                <Text
                  style={[
                    styles.taskTitle,
                    item.isCompleted && styles.taskTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>
                {item.dueDate && (
                  <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
                )}
              </TouchableOpacity>

              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityBadgeStyle.bg },
                ]}
              >
                <Text style={[styles.priorityText, { color: priorityBadgeStyle.text }]}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create-outline" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No {filter} tasks</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button above to create a custom task.
            </Text>
          </View>
        }
      />

      {/* Task Create / Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title..."
                placeholderTextColor="#9ca3af"
                value={titleInput}
                onChangeText={setTitleInput}
              />

              <Text style={styles.label}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const isSelected = priorityInput === p;
                  const colors = getPriorityColor(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        isSelected && {
                          backgroundColor: colors.bg,
                          borderColor: colors.text,
                        },
                      ]}
                      onPress={() => setPriorityInput(p)}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          isSelected && { color: colors.text, fontWeight: '700' },
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-07-25"
                placeholderTextColor="#9ca3af"
                value={dueDateInput}
                onChangeText={setDueDateInput}
              />

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Work, Personal, Shopping"
                placeholderTextColor="#9ca3af"
                value={categoryInput}
                onChangeText={setCategoryInput}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Text>
              </TouchableOpacity>

              {editingTask && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Delete Task</Text>
                </TouchableOpacity>
              )}
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
  tabsRow: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366f1',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  checkboxTouch: {
    paddingRight: 8,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  dueDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  editBtn: {
    padding: 4,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 3,
    backgroundColor: '#f9fafb',
  },
  priorityOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
