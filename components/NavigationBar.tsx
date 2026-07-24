import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ScreenTab =
  | 'dashboard'
  | 'timeline'
  | 'chat'
  | 'notes'
  | 'tasks'
  | 'budget'
  | 'calendar'
  | 'settings';

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
    { id: 'budget', label: 'Budget', icon: 'wallet-outline' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onSelectTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? '#6366f1' : '#9ca3af'}
              />
              <Text style={[styles.tabLabel, isActive ? styles.labelActive : styles.labelInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabItemActive: {
    backgroundColor: '#eff6ff',
  },
  tabLabel: {
    fontSize: 11,
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

