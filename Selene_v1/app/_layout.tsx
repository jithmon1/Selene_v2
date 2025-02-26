
import { Stack } from 'expo-router'
import { UserDataProvider } from './providers/UserDataProvider'
const RootLayout = () => {
  return (
    <UserDataProvider>
    <Stack screenOptions={{
      headerShown: false
    }}>
        <Stack.Screen name="index" options={{headerShown:false}}  />
        <Stack.Screen name="Login" options={{headerShown:false}}  />
        <Stack.Screen name="tasks" options={{headerShown: false}} />

        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="journals" options={{headerShown: false}} />

    </Stack>
    </UserDataProvider>
  )
}

export default RootLayout

