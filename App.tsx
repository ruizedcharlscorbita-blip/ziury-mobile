import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  AIProvider,
  Conversation,
  Message,
  Note,
  Task,
  CalendarEvent,
  TimelineItem,
  BudgetItem,
} from './types';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, AVAILABLE_MODELS } from './constants/models';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { NavigationBar, ScreenTab } from './components/NavigationBar';
import { HistoryDrawer } from './components/HistoryDrawer';

import { DashboardScreen } from './screens/DashboardScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { NotesScreen } from './screens/NotesScreen';
import { TasksScreen } from './screens/TasksScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import {
  initDatabase,
  getConversations,
  saveConversation,
  getMessagesForConversation,
  saveMessage,
  deleteConversation,
  getNotes,
  saveNote,
  getTasks,
  saveTask,
  deleteTask,
  getEvents,
  getTimelineItems,
  getBudgetItems,
} from './services/database';
import { generateAIResponse } from './services/ai';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('dashboard');
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_PROVIDER);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);

  // Data states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);

  // UI modal states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    await initDatabase();
    await refreshAllData();
  };

  const refreshAllData = async () => {
    const convs = await getConversations();
    const n = await getNotes();
    const t = await getTasks();
    const e = await getEvents();
    const tl = await getTimelineItems();
    const b = await getBudgetItems();

    setConversations(convs);
    setNotes(n);
    setTasks(t);
    setEvents(e);
    setTimeline(tl);
    setBudget(b);
  };

  const handleSelectModel = (newProvider: AIProvider, newModelId: string) => {
    setProvider(newProvider);
    setModel(newModelId);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setCurrentTab('chat');
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setCurrentConversation(conv);
    setProvider(conv.provider);
    setModel(conv.model);
    const msgs = await getMessagesForConversation(conv.id);
    setMessages(msgs);
    setCurrentTab('chat');
  };

  const handleDeleteConversation = async (convId: string) => {
    await deleteConversation(convId);
    if (currentConversation?.id === convId) {
      handleNewChat();
    }
    await refreshAllData();
  };

  const handleCreateNote = async () => {
    const now = Date.now();
    await saveNote({
      id: 'note_' + now,
      title: 'New Memory Note',
      content: 'Tap to edit markdown note content...',
      createdAt: now,
      updatedAt: now,
    });
    await refreshAllData();
  };

  const handleCreateTask = async () => {
    const now = Date.now();
    await saveTask({
      id: 'task_' + now,
      title: 'New Action Task',
      dueDate: new Date(now + 86400000).toISOString().split('T')[0],
      isCompleted: false,
      priority: 'medium',
      createdAt: now,
    });
    await refreshAllData();
  };

  const handleSaveTask = async (task: Task) => {
    await saveTask(task);
    await refreshAllData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    await refreshAllData();
  };

  const handleSendChat = async (userContent: string) => {
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
    await refreshAllData();

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
        content: 'Error: Failed to connect to OmniRouter / AI brain. Please check your settings.',
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

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            tasks={tasks}
            timeline={timeline}
            budget={budget}
            onNavigateTab={setCurrentTab}
            onQuickCapture={() => handleNewChat()}
          />
        );
      case 'timeline':
        return <TimelineScreen items={timeline} />;
      case 'chat':
        return (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatMessage message={item} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <ChatInput onSend={handleSendChat} isLoading={isLoading} />
          </KeyboardAvoidingView>
        );
      case 'notes':
        return (
          <NotesScreen
            notes={notes}
            onNewNote={handleCreateNote}
          />
        );
      case 'tasks':
        return (
          <TasksScreen
            tasks={tasks}
            onRefresh={refreshAllData}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            selectedProvider={provider}
            selectedModel={model}
            onSelectModel={handleSelectModel}
            onRefreshData={refreshAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Header
        activeModelName={activeModelName}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
      />

      <View style={styles.flex}>{renderActiveScreen()}</View>

      <NavigationBar currentTab={currentTab} onSelectTab={setCurrentTab} />

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
  messageList: {
    paddingVertical: 12,
  },
});
