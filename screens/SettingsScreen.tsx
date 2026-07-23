import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider, APIKeys } from '../types';
import { AVAILABLE_MODELS } from '../constants/models';
import { getAllAPIKeys, saveAPIKey } from '../services/keys';
import { GoogleSyncCard } from '../components/GoogleSyncCard';

interface SettingsScreenProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  onSelectModel: (provider: AIProvider, modelId: string) => void;
  onRefreshData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  selectedProvider,
  selectedModel,
  onSelectModel,
  onRefreshData,
}) => {
  const [keys, setKeys] = useState<APIKeys>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const k = await getAllAPIKeys();
    setKeys(k);
  };

  const handleSave = async () => {
    if (keys.omniRouterUrl !== undefined) await saveAPIKey('omniRouterUrl', keys.omniRouterUrl);
    if (keys.omniRouterKey !== undefined) await saveAPIKey('omniRouterKey', keys.omniRouterKey);
    if (keys.google !== undefined) await saveAPIKey('google', keys.google);
    if (keys.anthropic !== undefined) await saveAPIKey('anthropic', keys.anthropic);
    if (keys.openai !== undefined) await saveAPIKey('openai', keys.openai);
    if (keys.groq !== undefined) await saveAPIKey('groq', keys.groq);
    if (keys.openrouter !== undefined) await saveAPIKey('openrouter', keys.openrouter);
    if (keys.ollamaHost !== undefined) await saveAPIKey('ollamaHost', keys.ollamaHost);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings & Sync</Text>
      <Text style={styles.subtitle}>
        OmniRouter • Google Account Data Sync • BYOK Configuration
      </Text>

      {/* Google Account Integration */}
      <GoogleSyncCard onSyncComplete={onRefreshData} />

      {/* OmniRouter Setup */}
      <Text style={styles.sectionHeader}>OMNIROUTER CONFIGURATION</Text>
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>OmniRouter Base URL (Local LAN / Server)</Text>
          <TextInput
            style={styles.input}
            placeholder="http://192.168.1.100:4000"
            value={keys.omniRouterUrl || ''}
            onChangeText={(text) => setKeys({ ...keys, omniRouterUrl: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OmniRouter API Key (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OmniRouter Key"
            secureTextEntry
            value={keys.omniRouterKey || ''}
            onChangeText={(text) => setKeys({ ...keys, omniRouterKey: text })}
          />
        </View>
      </View>

      {/* Model Selector */}
      <Text style={styles.sectionHeader}>SELECT ACTIVE MODEL</Text>
      {AVAILABLE_MODELS.map((m) => {
        const isSelected = m.id === selectedModel;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.modelCard, isSelected && styles.modelCardSelected]}
            onPress={() => onSelectModel(m.provider, m.id)}
          >
            <View style={styles.modelRow}>
              <Text style={styles.modelName}>{m.name}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={18} color="#6366f1" />}
            </View>
            <Text style={styles.modelDesc}>{m.description}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Other API Keys */}
      <Text style={[styles.sectionHeader, { marginTop: 24 }]}>OTHER BYOK PROVIDERS</Text>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Google Gemini API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Google Gemini API Key"
            secureTextEntry
            value={keys.google || ''}
            onChangeText={(text) => setKeys({ ...keys, google: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Anthropic Claude API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Anthropic API Key"
            secureTextEntry
            value={keys.anthropic || ''}
            onChangeText={(text) => setKeys({ ...keys, anthropic: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OpenAI API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OpenAI API Key"
            secureTextEntry
            value={keys.openai || ''}
            onChangeText={(text) => setKeys({ ...keys, openai: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Groq Key (Llama 3 70B)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Groq API Key"
            secureTextEntry
            value={keys.groq || ''}
            onChangeText={(text) => setKeys({ ...keys, groq: text })}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>
          {saved ? 'Configuration Saved! ✓' : 'Save All Settings'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
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
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  modelCard: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  modelCardSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modelDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
