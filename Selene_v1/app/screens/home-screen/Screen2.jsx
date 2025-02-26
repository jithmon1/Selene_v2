// screens/home-screen/Screen2.jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Screen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Screen 2</Text>
      <Button 
        title="Go to Screen 1" 
        onPress={() => navigation.navigate('Screen1')}
      />
      <Button 
        title="Go back to Home" 
        onPress={() => navigation.navigate('Main')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Screen2;