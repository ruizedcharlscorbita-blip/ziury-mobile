import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DEFAULT_GOOGLE_ACCOUNT,
  importFromGoogleAccount,
  exportToGoogleAccount,
} from '../services/googleSync';
import { GoogleSyncStatus } from '../types';

interface GoogleSyncCardProps {
  onSyncComplete?: () => void;
}

export const GoogleSyncCard: React.FC<GoogleSyncCardProps> = ({ onSyncComplete }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<GoogleSyncStatus>({
    connected: true,
    accountEmail: DEFAULT_GOOGLE_ACCOUNT,
    syncedNotesCount: 0,
    syncedTasksCount: 0,
    syncedEventsCount: 0,
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await importFromGoogleAccount(status.accountEmail);
      setStatus(res);
      setMessage(`Successfully imported Google Notes, Tasks & Calendar!`);
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      setMessage('Import failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await exportToGoogleAccount(status.accountEmail);
      setMessage(`Exported ${res.exportedNotes} notes, ${res.exportedTasks} tasks & ${res.exportedEvents} events to Google!`);
    } catch (e) {
      setMessage('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="logo-google" size={22} color="#ea4335" />
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Google Account Integration</Text>
          <Text style={styles.accountEmail}>{status.accountEmail}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.statusText}>Connected</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Sync Notes, Tasks, and Calendar events directly with your Google Account.
      </Text>

      {message && <Text style={styles.messageBanner}>{message}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.syncBtn, styles.importBtn]}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={16} color="#ffffff" />
              <Text style={styles.btnText}>Import from Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.syncBtn, styles.exportBtn]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={16} color="#ffffff" />
              <Text style={styles.btnText}>Export to Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 10,
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  accountEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
    lineHeight: 16,
  },
  messageBanner: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  syncBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
  },
  importBtn: {
    backgroundColor: '#6366f1',
    marginRight: 6,
  },
  exportBtn: {
    backgroundColor: '#10b981',
    marginLeft: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});
