import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, TimelineItem, BudgetItem } from '../types';
import { CaptureType } from '../components/QuickCaptureFAB';

interface DashboardScreenProps {
  tasks: Task[];
  timeline: TimelineItem[];
  budget: BudgetItem[];
  onNavigateTab: (tab: any) => void;
  onQuickCapture: (type: CaptureType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  tasks,
  timeline,
  budget,
  onNavigateTab,
  onQuickCapture,
}) => {
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const totalExpense = budget
    .filter((b) => b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Welcome */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>YOUR SECOND BRAIN</Text>
        <Text style={styles.heroTitle}>Good Day! 👋</Text>
        <Text style={styles.heroSubtitle}>
          Everything captured. Automatically organized.
        </Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => onNavigateTab('tasks')}
        >
          <Ionicons name="checkbox-outline" size={22} color="#10b981" />
          <Text style={styles.statNumber}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statBox}
          onPress={() => onNavigateTab('timeline')}
        >
          <Ionicons name="time-outline" size={22} color="#6366f1" />
          <Text style={styles.statNumber}>{timeline.length}</Text>
          <Text style={styles.statLabel}>Memories Captured</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statBox}>
          <Ionicons name="wallet-outline" size={22} color="#06b6d4" />
          <Text style={styles.statNumber}>${totalExpense.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Expenses</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Tiles */}
      <Text style={styles.sectionHeader}>QUICK CAPTURE</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => onQuickCapture('note')}
        >
          <Ionicons name="document-text" size={20} color="#6366f1" />
          <Text style={styles.actionLabel}>New Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => onQuickCapture('task')}
        >
          <Ionicons name="checkbox" size={20} color="#10b981" />
          <Text style={styles.actionLabel}>Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => onQuickCapture('voice')}
        >
          <Ionicons name="mic" size={20} color="#ec4899" />
          <Text style={styles.actionLabel}>Voice Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => onQuickCapture('budget')}
        >
          <Ionicons name="wallet" size={20} color="#06b6d4" />
          <Text style={styles.actionLabel}>Log Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Timeline Stream */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeader}>RECENT MEMORIES</Text>
        <TouchableOpacity onPress={() => onNavigateTab('timeline')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {timeline.slice(0, 4).map((item) => (
        <View key={item.id} style={styles.timelineCard}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.timelineSummary}>{item.summary}</Text>
          </View>
          <Text style={styles.timelineTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c7d2fe',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    width: '31%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginRight: 10,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  timelineSummary: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
