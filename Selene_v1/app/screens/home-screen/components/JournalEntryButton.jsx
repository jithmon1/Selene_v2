import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


const JournalEntryButton = ({navigation}) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('JournalEntry')}>
            <Text style={styles.floatingButtonText}>+</Text>
    </TouchableOpacity>
  )
}

export default JournalEntryButton
const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 30, // Distance from the bottom of the screen
        left: '50%', // Centers horizontally
        marginLeft: -30, // Adjusts for the button's half width (60 / 2)
        backgroundColor: 'teal', // Button color
        width: 60, // Width of the button
        height: 60, // Height of the button
        borderRadius: 30, // Circular button
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Shadow effect for better visibility
      },
      floatingButtonText: {
        fontSize: 40, // Larger "+" sign
        color: 'white',
        fontWeight: 'bold',
      },
})