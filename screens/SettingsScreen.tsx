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
import { AIProvider, APIKeys, AIModelOption } from '../types';
import {
  getAllAPIKeys,
  saveAPIKey,
  saveDiscoveredModels,
  getAllDiscoveredModels,
} from '../services/keys';
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
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.testBtn, isTesting && styles.testBtnDisabled]}
          onPress={onTest}
          disabled={isTesting || !value}
        >
          {isTesting ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Text style={styles.testBtnText}>Test & Discover</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Format hint */}
      {fmtResult && (
        <Text style={[styles.hintText, fmtResult.valid ? styles.hintOk : styles.hintFail]}>
          {fmtResult.valid ? '✓ ' : '✗ '}
          {fmtResult.message}
        </Text>
      )}

      {/* Live test result */}
      {liveResult && (
        <View style={[styles.liveBadge, liveResult.valid ? styles.liveOk : styles.liveFail]}>
          <Text style={[styles.liveText, liveResult.valid ? styles.liveTextOk : styles.liveTextFail]}>
            {liveResult.message}
          </Text>
        </View>
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
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, ValidatorResult | null>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [discoveredModelsMap, setDiscoveredModelsMap] = useState<Record<string, AIModelOption[]>>({});

  useEffect(() => {
    loadKeys();
    loadDiscoveredModels();
  }, []);

  const loadKeys = async () => {
    const k = await getAllAPIKeys();
    setKeys(k);
  };

  const loadDiscoveredModels = async () => {
    const map = await getAllDiscoveredModels();
    setDiscoveredModelsMap({ ...map });
  };

  const handleTest = useCallback(async (provider: string, key: string) => {
    setTesting((t) => ({ ...t, [provider]: true }));
    setTestResults((r) => ({ ...r, [provider]: null }));
    const result = await testKeyLive(provider, key);
    setTestResults((r) => ({ ...r, [provider]: result }));

    if (result.valid && result.discoveredModels && result.discoveredModels.length > 0) {
      const discovered = result.discoveredModels;
      await saveDiscoveredModels(provider, discovered);
      setDiscoveredModelsMap((m) => ({ ...m, [provider]: discovered }));
    }

    setTesting((t) => ({ ...t, [provider]: false }));
  }, []);

  const fmtResult = (provider: string, key: string | undefined): ValidatorResult | null => {
    if (!key) return null;
    return validateKeyFormat(provider, key);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let hasError = false;

    // Validate active/modified keys before saving
    const entriesToSave: Array<[keyof APIKeys, string]> = [];

    if (keys.omniRouterUrl) entriesToSave.push(['omniRouterUrl', keys.omniRouterUrl]);
    if (keys.omniRouterKey) entriesToSave.push(['omniRouterKey', keys.omniRouterKey]);
    if (keys.google) entriesToSave.push(['google', keys.google]);
    if (keys.anthropic) entriesToSave.push(['anthropic', keys.anthropic]);
    if (keys.openai) entriesToSave.push(['openai', keys.openai]);
    if (keys.groq) entriesToSave.push(['groq', keys.groq]);
    if (keys.openrouter) entriesToSave.push(['openrouter', keys.openrouter]);
    if (keys.ollamaHost) entriesToSave.push(['ollamaHost', keys.ollamaHost]);

    // Perform live validation on entered non-empty keys
    for (const [providerKey, val] of entriesToSave) {
      if (val && val.trim().length > 0) {
        setTesting((t) => ({ ...t, [providerKey]: true }));
        const liveRes = await testKeyLive(providerKey, val.trim());
        setTestResults((r) => ({ ...r, [providerKey]: liveRes }));
        setTesting((t) => ({ ...t, [providerKey]: false }));

        if (!liveRes.valid) {
          alert(`❌ Key Validation Failed for ${providerKey.toUpperCase()}:\n\n${liveRes.message}\n\nPlease check your credentials.`);
          hasError = true;
          break;
        } else if (liveRes.discoveredModels && liveRes.discoveredModels.length > 0) {
          const discovered = liveRes.discoveredModels;
          await saveDiscoveredModels(providerKey, discovered);
          setDiscoveredModelsMap((m) => ({ ...m, [providerKey]: discovered }));
        }
      }
    }

    if (!hasError) {
      // Save validated keys
      for (const [providerKey, val] of entriesToSave) {
        await saveAPIKey(providerKey, val);
      }

      if (onRefreshData) {
        onRefreshData();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }

    setIsSaving(false);
  };

  const hasAnyDiscoveredModels = Object.values(discoveredModelsMap).some(
    (arr) => arr && arr.length > 0
  );

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
          placeholder="Enter OmniRouter Key"
          secure
          onChange={(v) => setKeys({ ...keys, omniRouterKey: v })}
          fmtResult={fmtResult('omniRouterKey', keys.omniRouterKey)}
          liveResult={testResults['omniRouterKey'] ?? null}
          isTesting={testing['omniRouterKey'] ?? false}
          onTest={() => handleTest('omniRouterKey', keys.omniRouterKey || '')}
        />
      </View>

      {/* Provider Keys */}
      <Text style={styles.sectionHeader}>BYOK — PROVIDER API KEYS</Text>
      <View style={styles.card}>
        <KeyField
          label="Google Gemini API Key"
          provider="google"
          value={keys.google || ''}
          placeholder="Enter Google API Key"
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
          onChange={(v) => setKeys({ ...keys, openai: v })}
          fmtResult={fmtResult('openai', keys.openai)}
          liveResult={testResults['openai'] ?? null}
          isTesting={testing['openai'] ?? false}
          onTest={() => handleTest('openai', keys.openai || '')}
        />

        <KeyField
          label="Groq API Key"
          provider="groq"
          value={keys.groq || ''}
          placeholder="Enter Groq API Key"
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

      {/* Model Selector grouped by provider */}
      <Text style={styles.sectionHeader}>DISCOVERED MODELS & SELECTION</Text>

      {!hasAnyDiscoveredModels ? (
        <View style={styles.emptyModelsCard}>
          <Ionicons name="information-circle-outline" size={24} color="#6366f1" />
          <Text style={styles.emptyModelsText}>
            No validated models available yet. Enter your API Key or host URL above and tap Test & Discover or Save All Settings to fetch available models.
          </Text>
        </View>
      ) : (
        Object.entries(discoveredModelsMap).map(([providerName, modelList]) => {
          if (!modelList || modelList.length === 0) return null;
          return (
            <View key={providerName} style={styles.providerGroupCard}>
              <Text style={styles.providerGroupHeader}>
                {providerName.toUpperCase()} ({modelList.length} Models Found)
              </Text>
              {modelList.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.subModelCard, isSelected && styles.modelCardSelected]}
                    onPress={() => onSelectModel(m.provider, m.id)}
                  >
                    <View style={styles.modelRow}>
                      <View style={styles.radioDotContainer}>
                        <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
                          {m.provider} / {m.name}
                        </Text>
                        {m.description ? (
                          <Text style={styles.modelDesc}>{m.description}</Text>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveBtnText}>{saved ? '✓ Saved & Reloaded!' : 'Save & Validate All'}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  inputFlex: {
    flex: 1,
  },
  testBtn: {
    marginLeft: 8,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  testBtnDisabled: {
    opacity: 0.5,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },
  hintText: {
    fontSize: 11,
    marginTop: 4,
  },
  hintOk: {
    color: '#16a34a',
  },
  hintFail: {
    color: '#dc2626',
  },
  liveBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  liveOk: {
    backgroundColor: '#dcfce7',
  },
  liveFail: {
    backgroundColor: '#fee2e2',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
  },
  liveTextOk: {
    color: '#15803d',
  },
  liveTextFail: {
    color: '#b91c1c',
  },
  emptyModelsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  emptyModelsText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  providerGroupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  providerGroupHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  subModelCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  modelCardSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioDotContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  radioDotSelected: {
    backgroundColor: '#6366f1',
  },
  modelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  modelNameSelected: {
    color: '#4338ca',
  },
  modelDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpace: {
    height: 40,
  },
});
