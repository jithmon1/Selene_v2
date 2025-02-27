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
import { useRouter } from 'expo-router';
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

  const renderItem = ({ item }) => <JournalEntryItem entry={item} />;

  return (
    <View style={styles.container}>
      <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />

      <View style={styles.entriesContainer}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Journals for {formattedDate}</Text>
        </View>

        {filteredEntries?.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={40} color={lightColors.primary} />
            <Text style={styles.noEntries}>No entries for this date</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* AI Journal Floating Button */}
      <TouchableOpacity 
        style={styles.aiButton}
        onPress={() => router.push('/chat/AIJournalScreen')}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="sparkles" size={24} color="white" />
          <Text style={styles.aiButtonText}>AI Journal Assistant</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const JournalEntryItem = ({ entry }) => {
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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

      {entry.audioUrl && (
        <TouchableOpacity style={styles.audioButton} onPress={handlePlayAudio}>
          <Ionicons 
            name={isPlayingAudio ? 'pause-circle' : 'play-circle'} 
            size={24} 
            color="white" 
          />
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
    marginTop: 20,
    marginBottom: 80, // Space for the floating button
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.primary,
    fontFamily: 'firamedium',
  },
  aiButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    transform: [{ translateY: -70 }],
    backgroundColor: lightColors.primary,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'firamedium',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEntries: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'firaregular',
  },
  listContent: {
    paddingBottom: 20,
  },
  entry: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.primary,
    marginBottom: 8,
    fontFamily: 'firamedium',
  },
  entryContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'firaregular',
  },
  mediaScroll: {
    marginVertical: 12,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  audioButton: {
    backgroundColor: lightColors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'firamedium',
  },
});

export default HomeScreen;