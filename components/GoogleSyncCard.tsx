import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  googleDiscovery,
  GOOGLE_OAUTH_SCOPES,
  saveGoogleToken,
  getGoogleToken,
  saveGoogleUser,
  getGoogleUser,
  logoutGoogle,
  fetchGoogleUserProfile,
  syncGoogleData,
  GoogleUserProfile,
} from '../services/googleSync';

interface GoogleSyncCardProps {
  onSyncComplete?: () => void;
}

// Client ID placeholder for Expo Web / Native OAuth redirect
const GOOGLE_CLIENT_ID = '789218320491-auth.apps.googleusercontent.com';

export const GoogleSyncCard: React.FC<GoogleSyncCardProps> = ({ onSyncComplete }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'ziurymobile',
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: GOOGLE_OAUTH_SCOPES,
      redirectUri,
    },
    googleDiscovery
  );

  useEffect(() => {
    checkInitialAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleAuthSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const checkInitialAuth = async () => {
    const u = await getGoogleUser();
    if (u) {
      setUser(u);
    }
  };

  const handleAuthSuccess = async (token: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await saveGoogleToken(token);
      const profile = await fetchGoogleUserProfile(token);
      if (profile) {
        setUser(profile);
        await saveGoogleUser(profile);
      }
      const syncRes = await syncGoogleData(token);
      setMessage(`Authenticated! Synced ${syncRes.tasksCount} Google Tasks & ${syncRes.eventsCount} Calendar Events.`);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setMessage('Auth error. Could not complete Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (request) {
        const res = await promptAsync();
        if (res.type === 'success' && res.authentication?.accessToken) {
          await handleAuthSuccess(res.authentication.accessToken);
        }
      } else {
        const authUrl = `${googleDiscovery.authorizationEndpoint}?client_id=${encodeURIComponent(
          GOOGLE_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=token&scope=${encodeURIComponent(GOOGLE_OAUTH_SCOPES.join(' '))}`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        if (result.type === 'success' && result.url) {
          const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
          const token = params.get('access_token');
          if (token) {
            await handleAuthSuccess(token);
          }
        }
      }
    } catch (e) {
      setMessage('Sign in cancelled or interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setMessage('Logged out of Google Account.');
  };

  const handleManualSync = async () => {
    const token = await getGoogleToken();
    if (!token) {
      setMessage('Please sign in with Google first.');
      return;
    }
    setLoading(true);
    try {
      const syncRes = await syncGoogleData(token);
      setMessage(`Synced ${syncRes.tasksCount} Google Tasks & ${syncRes.eventsCount} Calendar Events.`);
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      setMessage('Sync failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="logo-google" size={24} color="#ea4335" />
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Google Account Integration</Text>
          <Text style={styles.accountEmail}>
            {user ? user.email : 'No account connected'}
          </Text>
        </View>

        {user ? (
          <View style={styles.statusBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.statusText}>Authorized</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.loggedOutBadge]}>
            <Text style={[styles.statusText, styles.loggedOutText]}>Offline</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        Sign in to grant ZIURY Mobile permission to access & sync your Google Calendar and Google Tasks.
      </Text>

      {message && <Text style={styles.messageBanner}>{message}</Text>}

      {user ? (
        <View style={styles.userRow}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name?.[0] || 'G'}</Text>
            </View>
          )}

          <View style={styles.flex}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.scopeTag}>Calendar & Tasks Authorized</Text>
          </View>

          <TouchableOpacity style={styles.syncIconButton} onPress={handleManualSync} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Ionicons name="sync-outline" size={20} color="#6366f1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color="#ffffff" />
              <Text style={styles.signInText}>Sign in with Google Account</Text>
            </>
          )}
        </TouchableOpacity>
      )}
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
  loggedOutBadge: {
    backgroundColor: '#f3f4f6',
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
  loggedOutText: {
    color: '#9ca3af',
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
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea4335',
    height: 44,
    borderRadius: 10,
    marginTop: 14,
  },
  signInText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ea4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  flex: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  scopeTag: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 1,
  },
  syncIconButton: {
    padding: 8,
    marginRight: 4,
  },
  logoutButton: {
    padding: 8,
  },
});
