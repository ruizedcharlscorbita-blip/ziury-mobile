import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { saveTask } from '../services/database';

interface TasksScreenProps {
  tasks: Task[];
  onRefresh: () => void;
  onNewTask: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ tasks, onRefresh, onNewTask }) => {
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter((t) =>
    filter === 'pending' ? !t.isCompleted : t.isCompleted
  );

  const toggleTask = async (task: Task) => {
    await saveTask({ ...task, isCompleted: !task.isCompleted });
    onRefresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tasks & Todos</Text>
          <TouchableOpacity style={styles.addBtn} onPress={onNewTask}>
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskCard} onPress={() => toggleTask(item)}>
            <Ionicons
              name={item.isCompleted ? 'checkbox' : 'square-outline'}
              size={22}
              color={item.isCompleted ? '#10b981' : '#6366f1'}
            />
            <View style={styles.taskTextContainer}>
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
            </View>

            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No {filter} tasks</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button above to create a task with smart reminders.
            </Text>
          </View>
        }
      />
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
  taskTextContainer: {
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366f1',
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
});
