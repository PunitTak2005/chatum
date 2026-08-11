import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const { login, serverUrl, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [customServerUrl, setCustomServerUrl] = useState(serverUrl);
  const [avatarUri, setAvatarUri] = useState(null);
  const [error, setError] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const base64Avatar = `data:image/jpeg;base64,${asset.base64}`;
      setAvatarUri(base64Avatar);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter a display name');
      return;
    }

    setError('');
    const finalAvatar = avatarUri || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`;
    const res = await login(username.trim(), finalAvatar, customServerUrl.trim());
    if (!res.success) {
      setError(res.error || 'Failed to connect to server');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appTitle}>Chatum</Text>
          <Text style={styles.appSubtitle}>Real-Time Mobile Messenger</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Avatar Picker */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : { uri: `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'user'}` }
              }
              style={styles.avatar}
            />
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to upload custom photo</Text>

          {/* Username Input */}
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name (e.g. Aarav)"
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={(txt) => {
              setUsername(txt);
              if (error) setError('');
            }}
            autoCapitalize="words"
            maxLength={30}
          />

          {/* Server URL Input */}
          <Text style={styles.label}>Server URL (Backend)</Text>
          <TextInput
            style={styles.input}
            placeholder="http://10.0.2.2:9001 or Cloud URL"
            placeholderTextColor="#64748b"
            value={customServerUrl}
            onChangeText={setCustomServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, (!username.trim() || isLoading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Join Chatum</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 12
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5
  },
  appSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4
  },
  card: {
    backgroundColor: '#131c31',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8
  },
  avatarWrapper: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 6
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#6366f1'
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#131c31'
  },
  cameraIcon: {
    fontSize: 13
  },
  avatarHint: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginBottom: 18
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
});
