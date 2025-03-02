import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for the chatbot icon
import lightColors from '../constants/Colors';

const ChatBotButton = () => {
  const router = useRouter();

  const handlePress = () => {
   // router.push('/chatbot'); // Adjust the path to your chatbot screen
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons name="sparkles-outline" size={28} color="white" />
      <Text style={styles.buttonText}>Ask Selene</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 120, // Less width, more height for a rectangular shape
    height: 200,
    backgroundColor: lightColors.primary, // Blue color for a prominent button
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 5, // Shadow for better UI
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily:'firamedium',
    marginTop: 8, // Space between icon and text
  },
});

export default ChatBotButton;
