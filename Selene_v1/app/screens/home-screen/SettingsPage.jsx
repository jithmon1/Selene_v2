import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // If you're using AsyncStorage for data persistence
import { useNavigation } from '@react-navigation/native'; // For navigation

const themes = {
  blue: {
    background: '#ADD8E6',
    button: '#1E90FF',
  },
  green: {
    background: '#98FB98',
    button: '#32CD32',
  },
  pink: {
    background: '#FFB6C1',
    button: '#FF69B4',
  },
  custom: {
    background: '#FFD700',
    button: '#FF8C00',
  },
  dark: {
    background: '#333333',
    button: '#444444',
  },
};

const SettingsPage = ({ navigation }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pinLock, setPinLock] = useState('');
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themes.blue);

  const handleSyncToggle = (value) => {
    setSyncEnabled(value);
    Alert.alert('Sync', value ? 'Sync enabled' : 'Sync disabled');
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    setSelectedTheme(value ? themes.dark : themes.blue); // Only switch background and button colors
    Alert.alert('Theme', value ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const handlePinLock = () => {
    if (pinLock.length === 4) {
      setIsPinEnabled(true);
      Alert.alert('Pin Lock', 'PIN set successfully');
    } else {
      Alert.alert('Error', 'PIN must be 4 digits');
    }
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(themes[theme]);
    Alert.alert('Theme', `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme selected`);
  };

  const handleHelp = () => {
    Alert.alert('Help', 'This is the settings page. Adjust your preferences here.');
  };

  const handleLogout = async () => {
    try {
      // Clear user session data (e.g., tokens, user info from AsyncStorage)
      await AsyncStorage.removeItem('userToken'); // Replace 'userToken' with your actual key
      Alert.alert('Logout', 'You have been logged out successfully.');
      
      // Redirect to login screen
      navigation.navigate('Login'); // Make sure 'Login' matches the screen name in your navigation setup
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Enable Sync</Text>
        <Switch value={syncEnabled} onValueChange={handleSyncToggle} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={handleDarkModeToggle} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Set PIN</Text>
        <TextInput
          style={[styles.input, { borderColor: darkMode ? '#FFFFFF' : '#000000' }]}
          placeholder="Enter 4-digit PIN"
          placeholderTextColor={darkMode ? '#FFFFFF' : '#000000'}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          value={pinLock}
          onChangeText={setPinLock}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: selectedTheme.button }]}
          onPress={handlePinLock}
        >
          <Text style={styles.buttonText}>Set PIN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.themeSelector}>
        <Text style={styles.label}>Select Theme:</Text>
        {Object.keys(themes).filter((theme) => theme !== 'dark').map((theme) => (
          <TouchableOpacity
            key={theme}
            style={[styles.themeButton, { backgroundColor: themes[theme].button }]}
            onPress={() => handleThemeChange(theme)}
          >
            <Text style={styles.themeButtonText}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: selectedTheme.button }]}
          onPress={handleHelp}
        >
          <Text style={styles.footerButtonText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: selectedTheme.button }]}
          onPress={handleLogout}
        >
          <Text style={styles.footerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',  // Text color remains unchanged
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#000000',  // Text color remains unchanged
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginLeft: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  themeSelector: {
    marginTop: 16,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', // Text color remains unchanged
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsPage;
