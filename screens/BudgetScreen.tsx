import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetItem } from '../types';

interface BudgetScreenProps {
  items: BudgetItem[];
  onSaveBudgetItem: (item: BudgetItem) => Promise<void>;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({ items, onSaveBudgetItem }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [typeInput, setTypeInput] = useState<'expense' | 'income'>('expense');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const totalIncome = items
    .filter((i) => i.type === 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = items
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + i.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleSave = async () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;

    const newItem: BudgetItem = {
      id: 'bgt_' + Date.now(),
      type: typeInput,
      amount: amt,
      category: categoryInput.trim() || (typeInput === 'expense' ? 'Expense' : 'Income'),
      note: noteInput.trim() || undefined,
      timestamp: Date.now(),
    };

    await onSaveBudgetItem(newItem);
    setAmountInput('');
    setCategoryInput('');
    setNoteInput('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personal Finance</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Income, Expense & Balance Overview</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>NET MONTHLY BALANCE</Text>
          <Text style={styles.balanceAmount}>₱{netBalance.toFixed(2)}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-down-circle" size={16} color="#10b981" />
              <Text style={styles.incomeText}>+₱{totalIncome.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-up-circle" size={16} color="#ef4444" />
              <Text style={styles.expenseText}>-₱{totalExpense.toFixed(0)}</Text>
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
              {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Transactions Logged</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to log an expense or income entry.
            </Text>
          </View>
        }
      />

      {/* Dedicated Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Transaction Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeBadge, typeInput === 'expense' && styles.typeBadgeActiveExpense]}
                  onPress={() => setTypeInput('expense')}
                >
                  <Text style={[styles.typeText, typeInput === 'expense' && styles.typeTextActive]}>
                    EXPENSE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBadge, typeInput === 'income' && styles.typeBadgeActiveIncome]}
                  onPress={() => setTypeInput('income')}
                >
                  <Text style={[styles.typeText, typeInput === 'income' && styles.typeTextActive]}>
                    INCOME
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Amount (₱ PHP)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={amountInput}
                onChangeText={setAmountInput}
              />

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Groceries, Salary, Coffee"
                value={categoryInput}
                onChangeText={setCategoryInput}
              />

              <Text style={styles.label}>Note / Description (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Additional details..."
                value={noteInput}
                onChangeText={setNoteInput}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Transaction</Text>
              </TouchableOpacity>
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
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: '#f9fafb',
  },
  typeBadgeActiveExpense: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeBadgeActiveIncome: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  typeTextActive: {
    color: '#ffffff',
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
