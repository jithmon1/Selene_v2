import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { doc, collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Entypo } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

const JournalEntryPage = () => {
  const navigation = useNavigation();

  const [journalText, setJournalText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [audioUri, setAudioUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDate(formattedDate);
    setTime(formattedTime);

    requestAudioPermission();
  }, []);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your microphone to record audio.');
    }
  };

  const uploadToCloudinary = async (fileUri, fileType) => {
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: fileType,
      name: fileType === 'image/jpeg' ? 'journal_image.jpg' : 'journal_audio.m4a',
    });
    data.append('upload_preset', 'journal_upload_preset'); // Replace with your preset name
    data.append('cloud_name', 'dfshfcewh'); // Replace with your Cloudinary cloud name

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dfshfcewh/upload',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error.response?.data || error.message);
      throw new Error('Failed to upload media to Cloudinary.');
    }
  };

  const pickImageOrVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your gallery to proceed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const newMedia = { type: 'image', uri: result.assets[0].uri };
        setSelectedImages((prevImages) => [...prevImages, newMedia]);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
      Alert.alert('Error', 'Something went wrong while picking an image.');
    }
  };

  const handleAudioRecording = async () => {
    try {
      if (isRecording) {
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setAudioUri(uri);
          setRecording(null);
        }
        setIsRecording(false);
      } else {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error with audio recording:', error);
      Alert.alert('Error', 'Failed to record audio.');
    }
  };

  const toggleAudioPlayback = async () => {
    try {
      if (isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
      } else {
        if (sound) {
          await sound.playAsync();
        } else if (audioUri) {
          const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
          setSound(newSound);
          setIsPlaying(true);
          await newSound.playAsync();
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isPlaying && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error.message);
    }
  };

  const handleSave = async () => {
    if (!journalText.trim() && selectedImages.length === 0 && !audioUri) {
      Alert.alert('Error', 'Please add some text, media, or audio to save.');
      return;
    }

    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User is not logged in.');
        return;
      }

      let uploadedImageUrls = [];
      let uploadedAudioUrl = null;

      for (let media of selectedImages) {
        if (media.type === 'image') {
          const imageUrl = await uploadToCloudinary(media.uri, 'image/jpeg');
          uploadedImageUrls.push(imageUrl);
        }
      }

      if (audioUri) {
        uploadedAudioUrl = await uploadToCloudinary(audioUri, 'audio/m4a');
      }

      const docData = {
        text: journalText,
        date,
        time,
        images: uploadedImageUrls,
        audio: uploadedAudioUrl,
        createdAt: new Date(),
      };

      const userDocRef = doc(FIRESTORE_DB, 'users', userId);
      const journalsCollectionRef = collection(userDocRef, 'journals');
      await addDoc(journalsCollectionRef, docData);

      Alert.alert('Success', 'Journal entry saved successfully!');
      setJournalText('');
      setSelectedImages([]);
      setAudioUri(null);
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save journal entry.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateTimeText}>{date}</Text>
        <Text style={styles.dateTimeText}>{time}</Text>
      </View>

      <TextInput
        style={styles.journalInput}
        multiline
        numberOfLines={10}
        value={journalText}
        onChangeText={setJournalText}
        placeholder="Write your thoughts here..."
        textAlignVertical="top"
      />

      <View style={styles.mediaButtonsContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImageOrVideo}>
          <Entypo name="image" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleAudioRecording}
        >
          <Entypo name={isRecording ? 'controller-paus' : 'controller-record'} size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Entry</Text>
      </TouchableOpacity>

      <ScrollView horizontal style={styles.imageContainer}>
        {selectedImages.map((media, index) => (
          <Image key={index} source={{ uri: media.uri }} style={styles.media} />
        ))}
      </ScrollView>

      {audioUri && (
        <TouchableOpacity onPress={toggleAudioPlayback} style={styles.audioContainer}>
          <Text style={styles.audioText}>
            {isPlaying ? 'Stop Audio' : 'Play Audio'}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    height: 300,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mediaButton: {
    backgroundColor: 'teal',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'teal',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  media: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  audioContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  audioText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default JournalEntryPage;
