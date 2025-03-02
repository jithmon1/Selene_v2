import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Snackbar = ({ message, type }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false)); // Hide component after animation
      }, 3000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [message]);

  if (!visible || !message) return null;

  const backgroundColors = {
    success: '#4CAF50', // Green for success
    warning: '#FF9800', // Orange for warnings
    error: '#F44336', // Red for errors
  };

  const icons = {
    success: 'checkmark-circle',
    warning: 'alert-circle',
    error: 'close-circle',
  };

  return (
    <Animated.View style={[styles.snackbar, { backgroundColor: backgroundColors[type], transform: [{ translateY: slideAnim }] }]}>
      <Ionicons name={icons[type]} size={24} color="white" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    gap: 10,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Snackbar;
