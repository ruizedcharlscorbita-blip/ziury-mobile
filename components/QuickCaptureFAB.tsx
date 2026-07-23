import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type CaptureType = 'note' | 'task' | 'voice' | 'photo' | 'chat' | 'event' | 'budget';

interface QuickCaptureFABProps {
  onCapture: (type: CaptureType) => void;
}

export const QuickCaptureFAB: React.FC<QuickCaptureFABProps> = ({ onCapture }) => {
  const [isOpen, setIsOpen] = useState(false);

  const captureOptions: { type: CaptureType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { type: 'note', label: 'Note', icon: 'document-text', color: '#6366f1' },
    { type: 'task', label: 'Task', icon: 'checkbox', color: '#10b981' },
    { type: 'voice', label: 'Voice Note', icon: 'mic', color: '#ec4899' },
    { type: 'photo', label: 'Photo Note', icon: 'camera', color: '#f59e0b' },
    { type: 'event', label: 'Event', icon: 'calendar', color: '#8b5cf6' },
    { type: 'budget', label: 'Expense', icon: 'wallet', color: '#06b6d4' },
  ];

  const handleSelect = (type: CaptureType) => {
    setIsOpen(false);
    onCapture(type);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.85}
      >
        <Ionicons name={isOpen ? 'close' : 'add'} size={28} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>QUICK CAPTURE</Text>
            <View style={styles.grid}>
              {captureOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  style={styles.gridItem}
                  onPress={() => handleSelect(opt.type)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                    <Ionicons name={opt.icon} size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.itemLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 74,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 140,
    paddingHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 16,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
