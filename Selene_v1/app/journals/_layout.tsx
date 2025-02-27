
import { Stack } from 'expo-router'
const RootLayout = () => {
  return (
    <Stack screenOptions={{
      headerShown: false
    }}>
        <Stack.Screen name="JournalEntry" options={{headerShown: false}} />
        <Stack.Screen name="[id]" options={{headerShown: false}} />
        <Stack.Screen name="tags" options={{headerShown: false}} />
        <Stack.Screen name="SearchJournal" options={{headerShown: false}} />
        <Stack.Screen name="AllEntries" options={{headerShown: false}} />

    </Stack>
  )
}
