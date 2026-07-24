import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider, APIKeys } from '../types';
import { AVAILABLE_MODELS } from '../constants/models';
import { getAllAPIKeys, saveAPIKey } from '../services/keys';
import { GoogleSyncCard } from '../components/GoogleSyncCard';
import { validateKeyFormat, testKeyLive, ValidatorResult } from '../services/keyValidator';

interface KeyFieldProps {
  label: string;
  provider: string;
  value: string;
  placeholder: string;
  secure?: boolean;
  onChange: (v: string) => void;
  fmtResult: ValidatorResult | null;
  liveResult: ValidatorResult | null;
  isTesting: boolean;
  onTest: () => void;
}

const KeyField: React.FC<KeyFieldProps> = ({
  label,
  value,
  placeholder,
  secure = true,
  onChange,
  fmtResult,
  liveResult,
  isTesting,
  onTest,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          placeholder={placeholder}
          secureTextEntry={secure}
          value={value}
          onChangeText={onChange}
        />
        {value.trim().length > 0 && (
          <TouchableOpacity style={styles.testBtn} onPress={onTest} disabled={isTesting}>
            {isTesting ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={styles.testBtnText}>Test</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {fmtResult && !liveResult && (
        <Text style={[styles.statusHint, fmtResult.valid ? styles.hintOk : styles.hintErr]}>
          {fmtResult.message}
        </Text>
      )}

      {liveResult && (
        <Text style={[styles.statusHint, liveResult.valid ? styles.hintOk : styles.hintErr]}>
          {liveResult.message}
        </Text>
      )}
    </View>
  );
};

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
  const [testResults, setTestResults] = useState<Record<string, ValidatorResult | null>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const k = await getAllAPIKeys();
    setKeys(k);
  };

  const handleTest = useCallback(async (provider: string, key: string) => {
    setTesting((t) => ({ ...t, [provider]: true }));
    setTestResults((r) => ({ ...r, [provider]: null }));
    const result = await testKeyLive(provider, key);
    setTestResults((r) => ({ ...r, [provider]: result }));
    setTesting((t) => ({ ...t, [provider]: false }));
  }, []);

  const fmtResult = (provider: string, key: string | undefined): ValidatorResult | null => {
    if (!key) return null;
    return validateKeyFormat(provider, key);
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

    if (onRefreshData) {
      onRefreshData();
    }

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
        <KeyField
          label="OmniRouter Base URL (Local LAN / Server)"
          provider="omniRouterUrl"
          value={keys.omniRouterUrl || ''}
          placeholder="http://localhost:20128/v1"
          secure={false}
          onChange={(v) => setKeys({ ...keys, omniRouterUrl: v })}
          fmtResult={fmtResult('omniRouterUrl', keys.omniRouterUrl)}
          liveResult={testResults['omniRouterUrl'] ?? null}
          isTesting={testing['omniRouterUrl'] ?? false}
          onTest={() => handleTest('omniRouterUrl', keys.omniRouterUrl || '')}
        />
        <KeyField
          label="OmniRouter API Key"
          provider="omniRouterKey"
          value={keys.omniRouterKey || ''}
          placeholder="sk-54ed274bf8ec01d3-007f28-3ddd2a56"
          secure
          onChange={(v) => setKeys({ ...keys, omniRouterKey: v })}
          fmtResult={fmtResult('omniRouterKey', keys.omniRouterKey)}
          liveResult={testResults['omniRouterKey'] ?? null}
          isTesting={testing['omniRouterKey'] ?? false}
          onTest={() => handleTest('omniRouterKey', keys.omniRouterKey || '')}
        />
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
        <KeyField
          label="Google Gemini API Key"
          provider="google"
          value={keys.google || ''}
          placeholder="Enter Google Gemini API Key"
          secure
          onChange={(v) => setKeys({ ...keys, google: v })}
          fmtResult={fmtResult('google', keys.google)}
          liveResult={testResults['google'] ?? null}
          isTesting={testing['google'] ?? false}
          onTest={() => handleTest('google', keys.google || '')}
        />
        <KeyField
          label="Anthropic Claude API Key"
          provider="anthropic"
          value={keys.anthropic || ''}
          placeholder="Enter Anthropic API Key"
          secure
          onChange={(v) => setKeys({ ...keys, anthropic: v })}
          fmtResult={fmtResult('anthropic', keys.anthropic)}
          liveResult={testResults['anthropic'] ?? null}
          isTesting={testing['anthropic'] ?? false}
          onTest={() => handleTest('anthropic', keys.anthropic || '')}
        />
        <KeyField
          label="OpenAI API Key"
          provider="openai"
          value={keys.openai || ''}
          placeholder="Enter OpenAI API Key"
          secure
          onChange={(v) => setKeys({ ...keys, openai: v })}
          fmtResult={fmtResult('openai', keys.openai)}
          liveResult={testResults['openai'] ?? null}
          isTesting={testing['openai'] ?? false}
          onTest={() => handleTest('openai', keys.openai || '')}
        />
        <KeyField
          label="Groq Key (Llama 3 70B)"
          provider="groq"
          value={keys.groq || ''}
          placeholder="Enter Groq API Key"
          secure
          onChange={(v) => setKeys({ ...keys, groq: v })}
          fmtResult={fmtResult('groq', keys.groq)}
          liveResult={testResults['groq'] ?? null}
          isTesting={testing['groq'] ?? false}
          onTest={() => handleTest('groq', keys.groq || '')}
        />
        <KeyField
          label="OpenRouter API Key"
          provider="openrouter"
          value={keys.openrouter || ''}
          placeholder="Enter OpenRouter API Key"
          secure
          onChange={(v) => setKeys({ ...keys, openrouter: v })}
          fmtResult={fmtResult('openrouter', keys.openrouter)}
          liveResult={testResults['openrouter'] ?? null}
          isTesting={testing['openrouter'] ?? false}
          onTest={() => handleTest('openrouter', keys.openrouter || '')}
        />
        <KeyField
          label="Local Ollama Host URL"
          provider="ollamaHost"
          value={keys.ollamaHost || ''}
          placeholder="http://localhost:11434"
          secure={false}
          onChange={(v) => setKeys({ ...keys, ollamaHost: v })}
          fmtResult={fmtResult('ollamaHost', keys.ollamaHost)}
          liveResult={testResults['ollamaHost'] ?? null}
          isTesting={testing['ollamaHost'] ?? false}
          onTest={() => handleTest('ollamaHost', keys.ollamaHost || '')}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>
          {saved ? 'Configuration Saved! ✓' : 'Save All Settings'}
        </Text>
      </TouchableOpacity>

      {/* Data Backup & Privacy Section */}
      <Text style={[styles.sectionHeader, { marginTop: 24 }]}>LOCAL DATA & PRIVACY</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Offline Data Backup</Text>
        <Text style={styles.modelDesc}>
          Export all notes, tasks, events, budget items, and AI memories to a single JSON backup.
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#10b981', marginTop: 12 }]}
          onPress={async () => {
            try {
              const { exportAllDataJSON } = await import('../services/database');
              const json = await exportAllDataJSON();
              alert(`Export Successful! (${json.length} bytes exported)\n\nSample:\n${json.slice(0, 150)}...`);
            } catch (err) {
              alert('Export failed: ' + err);
            }
          }}
        >
          <Text style={styles.saveBtnText}>Export Backup (JSON)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#ef4444', marginTop: 12 }]}
          onPress={async () => {
            try {
              const { clearAllDatabaseData } = await import('../services/database');
              await clearAllDatabaseData();
              if (onRefreshData) onRefreshData();
              alert('All local SQLite data cleared cleanly.');
            } catch (err) {
              alert('Clear failed: ' + err);
            }
          }}
        >
          <Text style={styles.saveBtnText}>Purge All Local Data</Text>
        </TouchableOpacity>
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
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
  testBtn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  statusHint: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  hintOk: {
    color: '#10b981',
  },
  hintErr: {
    color: '#ef4444',
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
