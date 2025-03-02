import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import lightColors from '@/src/constants/Colors';
import { Activity } from 'lucide-react-native';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time?: string;
  media?: { type: string; url: string }[];
  audioUrl?: string;
  tags?: string[];
}

const JournalDisplay = () => {
  const { id } = useLocalSearchParams();
  const { userData, deleteJournal } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const journalEntry = userData?.find((entry: JournalEntry) => entry.id === id);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const router = useRouter();

  // Function to play audio
  const playAudio = async () => {
    if (!journalEntry?.audioUrl) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: journalEntry.audioUrl },
        { shouldPlay: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Function to stop audio
  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
  };

  const handleDelete = async () => {
    if (id) {
      setIsLoading(true);
      try {
        await deleteJournal(id);
        router.back();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
    <Ionicons name="arrow-back" size={24} color="black" />
  </TouchableOpacity>
  <Text style={styles.title}>Journal Entry</Text>
  <View style={{ flex: 1 }} />
  <TouchableOpacity onPress={() => {}} style={styles.appBarButton}>
    <Ionicons name="create-outline" size={32} color={lightColors.accent} />
  </TouchableOpacity>
</View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {journalEntry ? (
          <>
            {/* Title */}
            <Text style={styles.entryTitle}>{journalEntry.title}</Text>

            {/* Date & Time */}
            <Text style={styles.date}>
              {journalEntry.date} {journalEntry.time ? `• ${journalEntry.time}` : ''}
            </Text>

            {/* Content */}
            <Text style={styles.content}>{journalEntry.content}</Text>

            {/* Media (Images) */}
            {journalEntry.media && journalEntry.media.length > 0 && (
              <View style={styles.mediaContainer}>
                {journalEntry.media.map((media, index) => (
                  <View key={index}>
                    {media.type === 'image' ? (
                      <Image source={{ uri: media.url }} style={styles.image} />
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Audio Playback */}
            {journalEntry.audioUrl && (
              <View style={styles.audioContainer}>
                <TouchableOpacity onPress={playAudio} style={styles.audioButton}>
                  <Ionicons name="play-circle" size={30} color={lightColors.primary} />
                  <Text style={styles.buttonText}>Play Audio</Text>
                </TouchableOpacity>

                {sound && (
                  <TouchableOpacity onPress={stopAudio} style={styles.audioButton}>
                    <Ionicons name="stop-circle" size={30} color="red" />
                    <Text style={styles.buttonText}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Tags */}
            {journalEntry.tags && journalEntry.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {journalEntry.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              

              <TouchableOpacity onPress={handleDelete} style={styles.button}>
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
<ActivityIndicator size="large" color={lightColors.primary} />     )}
      </ScrollView>
    </View>
  );
};

export default JournalDisplay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'firamedium',
  },
  entryTitle: {
    fontSize: 24,
    fontFamily: 'firamedium',
    marginBottom: 5,
    color: lightColors.primary,
  },
  date: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'firaregular',
    marginBottom: 10,
  },
  content: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: 'firaregular',
  },
  mediaContainer: {
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: lightColors.accent,
    padding: 5,
    color: lightColors.secondary,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor:lightColors.error,
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'firaregular',
    color: 'white',	
  },
  notFound: {
    fontSize: 18,
    fontFamily: 'firaregular',
    textAlign: 'center',
    marginTop: 20,
  },
});
