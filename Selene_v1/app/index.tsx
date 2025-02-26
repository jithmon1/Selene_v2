import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { onAuthStateChanged } from 'firebase/auth';
import HomeScreen from './(tabs)/homeScreen'; // Adjust the import path as necessary
import Login from './Login'; // Adjust the import path as necessary
import { UserDataProvider } from './providers/UserDataProvider'; // Adjust the import path as necessary
import { FIREBASE_AUTH } from '@/FirebaseConfig';

export default function Index() {
  const [fontsLoaded] = useFonts({
    'firaregular': require('../assets/fonts/FiraSans-Regular.ttf'),
    'firabold': require('../assets/fonts/FiraSans-SemiBold.ttf'),
    'firamedium': require('../assets/fonts/FiraSans-Medium.ttf'),
    'firalight': require('../assets/fonts/FiraSans-Light.ttf'),
  });

  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      
      setUser(user);
      if (user) {
        router.push('/(tabs)/homeScreen');
      } else {
        router.push('/Login');
      }
    });
    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
  
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="teal" />
      </View>
   
  );
}