import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import lightColors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

interface JournalButtonProps {
  title: string;
  onPress: () => void;
  
}

const JournalButton: React.FC<JournalButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={[styles.button]} onPress={onPress}>
           <View style={styles.buttonDisplay}>
           <Ionicons name="add-circle-outline" size={24} color={lightColors.secondary}  />

<Text style={[styles.buttonText]}>{title}</Text>
</View>   
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%', // 100% width
    backgroundColor: lightColors.accent, 
    // Primary color
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: lightColors.secondary, // White text color
    fontFamily: 'firamedium', // Custom font
    fontSize: 18,
  },
    buttonDisplay:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
    },
});

export default JournalButton;