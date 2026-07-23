import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ScreenTab = 'dashboard' | 'timeline' | 'chat' | 'notes' | 'tasks' | 'settings';

interface NavigationBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: ScreenTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'dashboard', label: 'Home', icon: 'grid-outline' },
    { id: 'timeline', label: 'Timeline', icon: 'time-outline' },
    { id: 'chat', label: 'AI Chat', icon: 'chatbubbles-outline' },
    { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
    { id: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? '#6366f1' : '#9ca3af'}
            />
            <Text style={[styles.tabLabel, isActive ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  labelActive: {
    color: '#6366f1',
  },
  labelInactive: {
    color: '#9ca3af',
  },
});
