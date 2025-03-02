import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Calendar from '@/src/components/Calender';
import { useUserData } from '../providers/UserDataProvider';
import { Audio, Video } from 'expo-av';
import JournalButton from '@/src/components/JournalButton';
import { useRouter } from 'expo-router';
import JournalEntriesList from '@/src/components/JournalEntriesList';
import DailyQuote from '@/src/components/DailyQoute';
import ChatBotButton from '@/src/components/ChatBotButton';
import TasksComponent from '@/src/components/TaskComponent';
import JournalsComponent from '@/src/components/JournalFlatlistComponent';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '@/src/constants/Colors';

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const { userData } = useUserData();
  const router = useRouter();

  const formattedDate = moment(selectedDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
  const filteredEntries = userData?.filter((entry) => entry.date === formattedDate);
  
  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />     
      <View style={styles.quoteContainer}>
        <DailyQuote date={selectedDate} />
      </View>
      <View style={styles.row}>
        <ChatBotButton />
        <TasksComponent selectedDate={selectedDate} />
      </View>
      <View>
        <JournalsComponent entries={filteredEntries} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: -24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
  },
  journalContainer: {
    margin: 16,
  }
});

export default HomeScreen;
