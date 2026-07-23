import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider, Conversation, Message } from './types';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, AVAILABLE_MODELS } from './constants/models';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  initDatabase,
  getConversations,
  saveConversation,
  getMessagesForConversation,
  saveMessage,
  deleteConversation,
} from './services/database';
import { generateAIResponse } from './services/ai';

export default function App() {
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_PROVIDER);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    await initDatabase();
    await loadConversationsList();
  };

  const loadConversationsList = async () => {
    const list = await getConversations();
    setConversations(list);
  };

  const handleSelectModel = (newProvider: AIProvider, newModelId: string) => {
    setProvider(newProvider);
    setModel(newModelId);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setCurrentConversation(conv);
    setProvider(conv.provider);
    setModel(conv.model);
    const msgs = await getMessagesForConversation(conv.id);
    setMessages(msgs);
  };

  const handleDeleteConversation = async (convId: string) => {
    await deleteConversation(convId);
    if (currentConversation?.id === convId) {
      handleNewChat();
    }
    await loadConversationsList();
  };

  const handleSend = async (userContent: string) => {
    const now = Date.now();
    let conv = currentConversation;

    if (!conv) {
      conv = {
        id: 'conv_' + now,
        title: userContent.slice(0, 30),
        createdAt: now,
        updatedAt: now,
        provider,
        model,
        preview: userContent.slice(0, 50),
      };
      setCurrentConversation(conv);
      await saveConversation(conv);
    } else {
      conv.updatedAt = now;
      conv.preview = userContent.slice(0, 50);
      await saveConversation(conv);
    }

    const userMessage: Message = {
      id: 'msg_' + now,
      conversationId: conv.id,
      role: 'user',
      content: userContent,
      createdAt: now,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveMessage(userMessage);
    await loadConversationsList();

    setIsLoading(true);

    try {
      const responseText = await generateAIResponse(provider, model, updatedMessages);
      const assistantMessage: Message = {
        id: 'msg_' + Date.now(),
        conversationId: conv.id,
        role: 'assistant',
        content: responseText,
        createdAt: Date.now(),
        modelUsed: model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);
    } catch (error: any) {
      const errorMessage: Message = {
        id: 'msg_err_' + Date.now(),
        conversationId: conv.id,
        role: 'assistant',
        content: 'Error: Failed to connect to AI brain. Please check your API key in Settings.',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const activeModelOption = AVAILABLE_MODELS.find((m) => m.id === model);
  const activeModelName = activeModelOption ? activeModelOption.name : model;

  const suggestions = [
    'Write a React Native UI component for user profiles',
    'Explain how SQLite indexing works on mobile devices',
    'Help me debug an async state management issue',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Header
        activeModelName={activeModelName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={32} color="#6366f1" />
            </View>
            <Text style={styles.welcomeTitle}>Ziury AI Mobile</Text>
            <Text style={styles.welcomeSubtitle}>
              Swappable AI Brain • Local SQLite Memory • Offline First
            </Text>

            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>TRY ASKING:</Text>
              {suggestions.map((text, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionCard}
                  onPress={() => handleSend(text)}
                >
                  <Ionicons name="chatbox-ellipses-outline" size={16} color="#6366f1" />
                  <Text style={styles.suggestionText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </KeyboardAvoidingView>

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedProvider={provider}
        selectedModel={model}
        onSelectModel={handleSelectModel}
      />

      <HistoryDrawer
        visible={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 10,
    letterSpacing: 1,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  messageList: {
    paddingVertical: 12,
  },
});
