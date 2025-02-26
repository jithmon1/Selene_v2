import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';

// Import components from their correct paths
import HomeScreen from './HomeScreen';
import JournalCalendar from './JournalCalender';
import JournalEntryPage from './JournalEntryPage';
import TaskPage1 from './TaskPage1';
import SettingsPage from './SettingsPage';
import ChatSum from './ChatSum'; // Make sure this path matches your file structure

const HomeStack = createNativeStackNavigator();

function HomeStackLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider>
        <HomeStack.Navigator 
          initialRouteName="Main"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <HomeStack.Screen 
            name="Main" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <HomeStack.Screen 
            name="Calender" 
            component={JournalCalendar}
            options={{ title: 'Calendar' }}
          />
          <HomeStack.Screen 
            name="JournalEntry" 
            component={JournalEntryPage}
            options={{ title: 'Journal Entry' }}
          />
          <HomeStack.Screen 
            name="ChatSum" 
            component={ChatSum}
            options={{ title: 'Chat Summary' }}
          />
          <HomeStack.Screen 
            name="TaskPage1" 
            component={TaskPage1}
            options={{ title: 'Tasks' }}
          />
          <HomeStack.Screen 
            name="SettingsPage" 
            component={SettingsPage}
            options={{ title: 'Settings' }}
          />
        </HomeStack.Navigator>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeStackLayout;