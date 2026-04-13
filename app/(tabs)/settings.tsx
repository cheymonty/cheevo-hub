import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { setCredentials } = useAuth();
  const [inputUsername, setInputUsername] = useState('');
  const [inputApiKey, setInputApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!inputUsername.trim() || !inputApiKey.trim()) {
      Alert.alert('Error', 'Please enter both username and API key');
      return;
    }

    setSaving(true);
    try {
      await setCredentials(inputUsername.trim(), inputApiKey.trim());
      setInputApiKey('');
      setInputUsername('');
      Alert.alert('Success', 'Credentials saved successfully');
    } catch {
      Alert.alert('Error', 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type='title' style={styles.title}>
        Settings
      </ThemedText>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant='titleMedium' style={styles.sectionTitle}>
            RetroAchievements Credentials
          </Text>

          <TextInput
            label='Username'
            value={inputUsername}
            onChangeText={setInputUsername}
            mode='outlined'
            autoCapitalize='none'
            style={styles.input}
          />

          <TextInput
            label='Web API Key'
            value={inputApiKey}
            onChangeText={setInputApiKey}
            mode='outlined'
            secureTextEntry
            autoCapitalize='none'
            style={styles.input}
          />

          <ThemedText style={styles.helpText}>
            You can find your Web API Key in your RetroAchievements user
            settings.
          </ThemedText>

          <Button
            mode='contained'
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          >
            Save Credentials
          </Button>
        </Card.Content>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  helpText: {
    marginBottom: 16,
    color: '#666',
  },
  saveButton: {
    marginTop: 8,
  },
});
