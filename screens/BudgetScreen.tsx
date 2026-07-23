import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetItem } from '../types';

interface BudgetScreenProps {
  items: BudgetItem[];
  onNewBudget: () => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({ items, onNewBudget }) => {
  const totalIncome = items
    .filter((i) => i.type === 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = items
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + i.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personal Finance</Text>
          <TouchableOpacity style={styles.addBtn} onPress={onNewBudget}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Income, Expense & Balance Overview</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>NET MONTHLY BALANCE</Text>
          <Text style={styles.balanceAmount}>${netBalance.toFixed(2)}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-down-circle" size={16} color="#10b981" />
              <Text style={styles.incomeText}>+${totalIncome.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-up-circle" size={16} color="#ef4444" />
              <Text style={styles.expenseText}>-${totalExpense.toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Ionicons
              name={item.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={24}
              color={item.type === 'income' ? '#10b981' : '#ef4444'}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.categoryText}>{item.category}</Text>
              {item.note && <Text style={styles.noteText}>{item.note}</Text>}
            </View>
            <Text
              style={[
                styles.amountText,
                item.type === 'income' ? styles.incomeText : styles.expenseText,
              ]}
            >
              {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Transactions Logged</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to quickly log an expense or income entry.
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
  balanceCard: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c7d2fe',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeText: {
    color: '#10b981',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  expenseText: {
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  noteText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
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
