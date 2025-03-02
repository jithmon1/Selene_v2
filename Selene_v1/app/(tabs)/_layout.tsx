import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import TabBar from '@/src/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white', // Set the background color of the tab bar
        },
        
        headerShown: false, // Hide the header if unnecessary
      }}
      initialRouteName="homeScreen" // Set homeScreen as the default screen
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="taskScreen"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <FontAwesome name="tasks" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journalScreen"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <FontAwesome name="book" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mediaScreen"
        options={{
          title: 'Media',
          tabBarIcon: ({ color, size }) => <FontAwesome name="book" color={color} size={size} />,

        }}
      />
         
      {/* Add other screens here */}
    </Tabs>
  );
}
