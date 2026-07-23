import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../types';

interface HistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onDeleteConversation: (convId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  visible,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  const handleSelect = (conv: Conversation) => {
    onSelectConversation(conv);
    onClose();
  };

  const handleNew = () => {
    onNewChat();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.drawerContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Memory & History</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.newChatBtn} onPress={handleNew}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.newChatText}>New Conversation</Text>
            </TouchableOpacity>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isActive = item.id === activeConversationId;
                return (
                  <TouchableOpacity
                    style={[styles.itemCard, isActive && styles.itemCardActive]}
                    onPress={() => handleSelect(item)}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={isActive ? '#6366f1' : '#6b7280'}
                    />
                    <View style={styles.itemTextContainer}>
                      <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemDate}>
                        {new Date(item.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(item.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
                  <Text style={styles.emptyText}>No saved conversations yet</Text>
                </View>
              }
            />
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
  },
  drawerContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    height: 44,
    borderRadius: 10,
  },
  newChatText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemCardActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  itemTitleActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  itemDate: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});
