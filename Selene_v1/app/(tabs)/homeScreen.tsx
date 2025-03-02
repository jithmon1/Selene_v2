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

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const { userData } = useUserData();
  const router = useRouter();
  // Convert selectedDate to match journal entries' date format
  const formattedDate = moment(selectedDate, 'YYYY-MM-DD').format('DD MMMM YYYY');

  // Filter journal entries for the selected date
  const filteredEntries = userData?.filter((entry) => entry.date === formattedDate);
  const handlePress = () => {
    router.push('/journals/JournalEntry');
  };
  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  // Render each journal entry using our custom JournalEntryItem component
  //const renderItem = ({ item }) => <JournalEntriesList entries={item} />;

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
  journalContainer:{
    margin:16,
  }
  
  // entriesContainer: {
  //   flex: 1,
  //   paddingVertical: 10,
  // },
  // heading: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: 8,
  // },
  // noEntries: {
  //   fontSize: 20,
  //   color: 'gray',
  // },
  // noEntriesImage: {
  //   width: '80%',
  //   height: 200,
  //   resizeMode: 'contain',
    
  // },
  // noEntriesContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   gap:8,
  //   alignItems: 'center',
  // },
  // entry: {
  //   backgroundColor: '#f8f8f8',
  //   padding: 10,
  //   marginVertical: 5,
  //   borderRadius: 8,
  //   marginBottom: 10, // Adjust the margin as needed

  // },
  // entryTitle: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   marginBottom: 4,
  // },
  // entryContent: {
  //   fontSize: 14,
  //   color: 'gray',
  //   marginBottom: 8,
  // },
  // mediaScroll: {
  //   marginVertical: 8,
  // },
  // mediaThumbnail: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 8,
  //   marginRight: 8,
  // },
  // audioButton: {
  //   backgroundColor: '#007AFF',
  //   padding: 8,
  //   borderRadius: 6,
  //   alignItems: 'center',
  //   marginTop: 8,
  // },
  // audioButtonText: {
  //   color: '#fff',
  //   fontSize: 14,
  // },
});

export default HomeScreen;
