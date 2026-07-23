import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider, APIKeys } from '../types';
import { AVAILABLE_MODELS } from '../constants/models';
import { getAllAPIKeys, saveAPIKey } from '../services/keys';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProvider: AIProvider;
  selectedModel: string;
  onSelectModel: (provider: AIProvider, modelId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  selectedProvider,
  selectedModel,
  onSelectModel,
}) => {
  const [keys, setKeys] = useState<APIKeys>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      loadKeys();
    }
  }, [visible]);

  const loadKeys = async () => {
    const k = await getAllAPIKeys();
    setKeys(k);
  };

  const handleSaveKeys = async () => {
    if (keys.google !== undefined) await saveAPIKey('google', keys.google);
    if (keys.anthropic !== undefined) await saveAPIKey('anthropic', keys.anthropic);
    if (keys.openai !== undefined) await saveAPIKey('openai', keys.openai);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Brain Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Active Model Selection */}
          <Text style={styles.sectionTitle}>Select Active Model</Text>
          <Text style={styles.sectionSubtitle}>
            Choose which AI model powers Ziury's brain.
          </Text>

          {AVAILABLE_MODELS.map((item) => {
            const isSelected = item.id === selectedModel;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.modelCard, isSelected && styles.modelCardSelected]}
                onPress={() => onSelectModel(item.provider, item.id)}
              >
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{item.name}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                  )}
                </View>
                <Text style={styles.modelDescription}>{item.description}</Text>
                <View style={styles.providerPill}>
                  <Text style={styles.providerPillText}>
                    {item.provider.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* API Key Configuration */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Bring Your Own Key (BYOK)
          </Text>
          <Text style={styles.sectionSubtitle}>
            Keys are stored securely on-device using encrypted hardware storage.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google AI Studio Key (Gemini)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Google Gemini API Key"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={keys.google || ''}
              onChangeText={(text) => setKeys({ ...keys, google: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Anthropic API Key (Claude)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Anthropic API Key"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={keys.anthropic || ''}
              onChangeText={(text) => setKeys({ ...keys, anthropic: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>OpenAI API Key (GPT-4o)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OpenAI API Key"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={keys.openai || ''}
              onChangeText={(text) => setKeys({ ...keys, openai: text })}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveKeys}>
            <Text style={styles.saveButtonText}>
              {savedSuccess ? 'Saved Successfully! ✓' : 'Save Keys'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  modelCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  modelCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modelDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  providerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
  },
  providerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
