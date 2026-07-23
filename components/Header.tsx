import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  activeModelName: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModelName,
  onOpenSettings,
  onOpenHistory,
  onNewChat,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onOpenHistory} style={styles.iconButton}>
        <Ionicons name="menu-outline" size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>ZIURY</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>{activeModelName}</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity onPress={onNewChat} style={styles.iconButton}>
          <Ionicons name="create-outline" size={22} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 1.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#4f46e5',
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
