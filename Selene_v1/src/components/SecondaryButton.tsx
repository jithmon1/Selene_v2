import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '../constants/Colors';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  width?: number; // Optional width prop
  height?: number; // Optional height prop
  iconName?: string; // Optional icon name prop
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, width, height, iconName }) => {
  return (
    <TouchableOpacity style={[styles.button, { width, height }]} onPress={onPress}>
      {iconName && <Ionicons name={iconName} size={24} color={lightColors.accent} style={styles.icon} />}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: lightColors.primary, // Swapped background color
    
    
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none', // Remove outline
  },
  icon: {
    marginRight: 10, // Space between icon and text
  },
  buttonText: {
    color: lightColors.accent, // Swapped text color
    fontFamily: 'firamedium', // Custom font
    fontSize: 18,
  },
});

export default SecondaryButton;