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

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const { userData } = useUserData();

  // Convert selectedDate to match journal entries' date format
  const formattedDate = moment(selectedDate, 'YYYY-MM-DD').format('DD MMMM YYYY');

  // Filter journal entries for the selected date
  const filteredEntries = userData?.filter((entry) => entry.date === formattedDate);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  // Render each journal entry using our custom JournalEntryItem component
  const renderItem = ({ item }) => <JournalEntryItem entry={item} />;

  return (
    <View style={styles.container}>
      <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />

      <View style={styles.entriesContainer}>
        <Text style={styles.heading}>Journals for {formattedDate}</Text>
        {filteredEntries?.length === 0 ? (
          <Text style={styles.noEntries}>No entries for this date.</Text>
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>
    </View>
  );
};

// This component renders a single journal entry with its media (images, videos, audio)
const JournalEntryItem = ({ entry }) => {
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Cleanup the audio resource when the component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayAudio = async () => {
    if (!isPlayingAudio && entry.audioUrl) {
      try {
        const { sound: playbackSound } = await Audio.Sound.createAsync(
          { uri: entry.audioUrl },
          { shouldPlay: true }
        );
        setSound(playbackSound);
        setIsPlayingAudio(true);
        playbackSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlayingAudio(false);
            setSound(null);
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    } else if (sound) {
      await sound.stopAsync();
      setIsPlayingAudio(false);
      setSound(null);
    }
  };

  return (
    <View style={styles.entry}>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      <Text style={styles.entryContent}>{entry.content}</Text>

      {/* Display media if available */}
      {entry.media && entry.media.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
          {entry.media.map((mediaItem, index) => {
            if (mediaItem.type === 'image') {
              return (
                <Image
                  key={index}
                  source={{ uri: mediaItem.url }}
                  style={styles.mediaThumbnail}
                />
              );
            } else if (mediaItem.type === 'video') {
              return (
                <Video
                  key={index}
                  source={{ uri: mediaItem.url }}
                  style={styles.mediaThumbnail}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              );
            }
            return null;
          })}
        </ScrollView>
      )}

      {/* Audio control if an audio URL is provided */}
      {entry.audioUrl && (
        <TouchableOpacity style={styles.audioButton} onPress={handlePlayAudio}>
          <Text style={styles.audioButtonText}>
            {isPlayingAudio ? 'Stop Audio' : 'Play Audio'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
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
    fontSize: 16,
    color: 'gray',
  },
  entry: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
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
