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
  onDeleteConversation: (id: string) => void;
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
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.drawerContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Memory & History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => {
              onNewChat();
              onClose();
            }}
          >
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
                  onPress={() => {
                    onSelectConversation(item);
                    onClose();
                  }}
                >
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title || 'Conversation'}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {item.provider.toUpperCase()} • {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => onDeleteConversation(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={40} color="#9ca3af" />
                <Text style={styles.emptyText}>No saved conversations yet</Text>
              </View>
            }
          />
        </SafeAreaView>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    height: '100%',
    paddingHorizontal: 16,
  },
  backdrop: {
    width: '20%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 14,
  },
  newChatText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  itemCardActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#a5b4fc',
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 11,
    color: '#6b7280',
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
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});
