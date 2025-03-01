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
  const renderItem = ({ item }) => <JournalEntriesList entries={item} />;

  return (
    <View style={styles.container}>
      <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
      <View style={styles.quoteContainer}>
  <DailyQuote date={selectedDate} />
</View>

      <View style={styles.entriesContainer}>
      {filteredEntries?.length === 0 ? (
  <View style={styles.noEntriesContainer}>
    <Text style={styles.noEntries}> No journal entries for this date

    </Text>
    <JournalButton
              title="Create New Journal Entry"
              onPress={handlePress}
            />  </View>
) : (
  <JournalEntriesList entries={filteredEntries} />
)}
      </View>
    </View>
  );
};

// // This component renders a single journal entry with its media (images, videos, audio)
// const JournalEntryItem = ({ entry }) => {
//   const [sound, setSound] = useState(null);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

//   // Cleanup the audio resource when the component unmounts
//   useEffect(() => {
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [sound]);

//   const handlePlayAudio = async () => {
//     if (!isPlayingAudio && entry.audioUrl) {
//       try {
//         const { sound: playbackSound } = await Audio.Sound.createAsync(
//           { uri: entry.audioUrl },
//           { shouldPlay: true }
//         );
//         setSound(playbackSound);
//         setIsPlayingAudio(true);
//         playbackSound.setOnPlaybackStatusUpdate((status) => {
//           if (status.didJustFinish) {
//             setIsPlayingAudio(false);
//             setSound(null);
//           }
//         });
//       } catch (error) {
//         console.error('Error playing audio:', error);
//       }
//     } else if (sound) {
//       await sound.stopAsync();
//       setIsPlayingAudio(false);
//       setSound(null);
//     }
//   };

//   return (
//     <View style={styles.entry}>
//       <Text style={styles.entryTitle}>{entry.title}</Text>
//       <Text style={styles.entryContent}>{entry.content}</Text>

//       {/* Display media if available */}
//       {entry.media && entry.media.length > 0 && (
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
//           {entry.media.map((mediaItem, index) => {
//             if (mediaItem.type === 'image') {
//               return (
//                 <Image
//                   key={index}
//                   source={{ uri: mediaItem.url }}
//                   style={styles.mediaThumbnail}
//                 />
//               );
//             } else if (mediaItem.type === 'video') {
//               return (
//                 <Video
//                   key={index}
//                   source={{ uri: mediaItem.url }}
//                   style={styles.mediaThumbnail}
//                   useNativeControls
//                   resizeMode="cover"
//                   isLooping
//                 />
//               );
//             }
//             return null;
//           })}
//         </ScrollView>
//       )}

//       {/* Audio control if an audio URL is provided */}
//       {entry.audioUrl && (
//         <TouchableOpacity style={styles.audioButton} onPress={handlePlayAudio}>
//           <Text style={styles.audioButtonText}>
//             {isPlayingAudio ? 'Stop Audio' : 'Play Audio'}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  quoteContainer: {
    marginTop: -558, // Add this style to ensure a 14px margin
  },
  entriesContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noEntries: {
    fontSize: 20,
    color: 'gray',
  },
  noEntriesImage: {
    width: '80%',
    height: 200,
    resizeMode: 'contain',
    
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap:8,
    alignItems: 'center',
  },
  entry: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    marginBottom: 10, // Adjust the margin as needed

  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryContent: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  mediaScroll: {
    marginVertical: 8,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  audioButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default HomeScreen;
