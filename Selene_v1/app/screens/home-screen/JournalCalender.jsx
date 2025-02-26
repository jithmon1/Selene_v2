import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

const formatDateString = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
};

const JournalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const navigation = useNavigation();

  const currentDate = new Date();
  const currentDateString = formatDateString(currentDate);

  // Mock journal entries
  const journalEntries = {
    '2024-12-14': 'Had a productive day learning React Native!',
    '2024-12-15': 'Worked on the calendar feature for Selene.',
    '2024-12-16': 'Took a break, had a relaxing day!',
  };

  // Navigate to JournalEntryPage with the selected date
  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const entryForDate = journalEntries[dateString] || 'No entry available for this date.';
    setSelectedDate(dateString);
    navigation.navigate('JournalEntry', { date: dateString, entry: entryForDate });
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' },
          [currentDateString]: {
            marked: true,
            dotColor: 'green',
            activeOpacity: 0,
          },
        }}
        theme={{
          todayTextColor: 'red',
          arrowColor: 'blue',
          textDayFontWeight: 'bold',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default JournalCalendar;
