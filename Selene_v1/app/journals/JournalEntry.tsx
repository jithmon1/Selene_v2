import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { randomUUID } from 'expo-crypto';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio, Video } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import lightColors from '@/src/constants/Colors';
import SecondaryButton from '@/src/components/SecondaryButton';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, doc, setDoc } from '@firebase/firestore';
import { HfInference } from '@huggingface/inference';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  media?: MediaItem[];
  tags?: string[];
  audioUrl?: string;
}

interface AudioRecordingState {
  recording: Audio.Recording | null;
  isRecording: boolean;
  transcribedText: string;
}

const defaultTags = ['Personal', 'Work', 'Health', 'Travel', 'Goals', 'Hobbies'];

const getMediaTypes = () => {
  return ImagePicker.MediaType ? ImagePicker.MediaType.All : ImagePicker.MediaTypeOptions.All;
};

const JournalEntryPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [time, setTime] = useState(moment().format('HH:mm'));
  const [date, setDate] = useState(moment().format('DD MMMM YYYY'));
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState(defaultTags[0]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioState, setAudioState] = useState<AudioRecordingState>({
    recording: null,
    isRecording: false,
    transcribedText: '',
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // State for transcription recording using Hugging Face
  const [transcriptionRecording, setTranscriptionRecording] = useState<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Create a Hugging Face inference client with your token
  const hfClient = new HfInference("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");

  // Listen for keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // ---------------------------
  // Cloudinary Upload
  // ---------------------------
  const uploadToCloudinary = async (file: any, resourceType: string = 'raw') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'journal_upload_preset');
      formData.append('folder', 'journal_entries');

      const cloudName = 'dfshfcewh';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // ---------------------------
  // Audio Recording Functions
  // ---------------------------
  const startRecording = async () => {
    try {
      if (audioState.recording) {
        await audioState.recording.stopAndUnloadAsync();
      }
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) throw new Error('Microphone permission not granted');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setAudioState((prev) => ({ ...prev, recording, isRecording: true }));
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording');
      setAudioState((prev) => ({ ...prev, recording: null, isRecording: false }));
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioState.recording) return;
      await audioState.recording.stopAndUnloadAsync();
      setIsLoading(true);
      const uri = audioState.recording.getURI();
      if (!uri) throw new Error('No recording URI available');
      const audioFile = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'audio/m4a',
        name: `recording-${Date.now()}.m4a`,
      };
      const uploadResult = await uploadToCloudinary(audioFile, 'raw');
      setAudioUrl(uploadResult.secure_url);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      setAudioState((prev) => ({ ...prev, recording: null, isRecording: false }));
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to upload audio recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUrl) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
      setSound(sound);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // ---------------------------
  // Hugging Face Transcription Functions
  // ---------------------------
  const startTranscriptionRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Microphone permission not granted");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setTranscriptionRecording(recording);
      setIsTranscribing(true);
    } catch (error) {
      console.error("Failed to start transcription recording:", error);
      alert("Failed to start recording for transcription");
    }
  };

  const stopTranscriptionRecording = async () => {
    try {
      if (!transcriptionRecording) return null;
      await transcriptionRecording.stopAndUnloadAsync();
      const uri = transcriptionRecording.getURI();
      setIsTranscribing(false);
      setTranscriptionRecording(null);
      return uri;
    } catch (error) {
      console.error("Failed to stop transcription recording:", error);
      alert("Failed to stop recording for transcription");
      setIsTranscribing(false);
      setTranscriptionRecording(null);
      return null;
    }
  };

  // This function uses the Hugging Face Inference client for speech recognition.
  const handleHuggingFaceTranscription = async () => {
    if (!isTranscribing) {
      await startTranscriptionRecording();
    } else {
      const uri = await stopTranscriptionRecording();
      if (uri) {
        try {
          setIsLoading(true);
          const response = await fetch(uri);
          const blob = await response.blob();
          if (!blob.arrayBuffer) {
            blob.arrayBuffer = async () =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
              });
          }
          const output = await hfClient.automaticSpeechRecognition({
            data: blob,
            model: "openai/whisper-large-v3",
            provider: "fal-ai",
          });
          const transcribedText = output.text || "";
          setContent((prev) => prev + " " + transcribedText);
        } catch (error) {
          console.error("Transcription failed:", error);
          alert("Transcription failed");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // ---------------------------
  // Save Journal Entry
  // ---------------------------
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        alert('User not authenticated');
        return;
      }
      const newEntry: JournalEntry = {
        id: randomUUID(),
        title,
        content,
        time,
        date,
        // Include media only if mediaItems exist
        ...(mediaItems.length ? { media: mediaItems } : {}),
        tags,
        ...(audioUrl ? { audioUrl } : {}),
      };
      await setDoc(doc(collection(FIRESTORE_DB, 'users', userId, 'journals'), newEntry.id), newEntry);
      alert('Journal entry saved successfully');
      router.back();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setDate(moment(currentDate).format('DD MMMM YYYY'));
  };

  // ---------------------------
  // Media Selection
  // ---------------------------
  const pickImage = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getMediaTypes(),
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: asset.type === 'video' ? `video-${Date.now()}.mp4` : `image-${Date.now()}.jpg`,
        };
        const resourceType = asset.type === 'video' ? 'video' : 'image';
        const uploadResult = await uploadToCloudinary(file, resourceType);
        setMediaItems((prev) => [...prev, { url: uploadResult.secure_url, type: resourceType }]);
      }
    } catch (error) {
      console.error('Error picking/uploading media:', error);
      alert('Failed to upload media');
    } finally {
      setIsLoading(false);
    }
  };

  const recordAudioHandler = () => {
    if (audioState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const addTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag('');
    } else if (!tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
    }
  };

  // ---------------------------
  // UI Render
  // ---------------------------
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Appbar.Header style={styles.header}>
        <AntDesign name="back" size={26} color={lightColors.textSecondary} onPress={handleBack} />
        <Text style={styles.buttonText}>Create Journal Entry</Text>
        <SecondaryButton title="SAVE" onPress={handleSave} width={56} height={32} />
      </Appbar.Header>
      <TouchableOpacity activeOpacity={1} style={styles.touchableContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateTime}>{date}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={26} color={lightColors.primary} />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker value={new Date()} mode="date" display="default" onChange={onDateChange} />
          )}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerDropdown}>
              <Picker selectedValue={selectedTag} onValueChange={(itemValue) => setSelectedTag(itemValue)} style={styles.picker}>
                {defaultTags.map((tag) => (
                  <Picker.Item key={tag} label={tag} value={tag} style={styles.pickerItem} />
                ))}
              </Picker>
            </View>
            <TextInput style={styles.customTagInput} placeholder="Add custom tag" value={customTag} onChangeText={setCustomTag} />
            <TouchableOpacity onPress={addTag} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Tag</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <TextInput
            style={[styles.textInput, { fontSize: 22 }]}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.textInput, styles.contentInput]}
            placeholder="Write your journal entry here..."
            multiline
            value={content}
            onChangeText={setContent}
          />
          <View style={styles.mediaContainer}>
            {mediaItems.map((item, index) =>
              item.type === 'image' ? (
                <Image key={index} source={{ uri: item.url }} style={styles.image} />
              ) : (
                <Video
                  key={index}
                  source={{ uri: item.url }}
                  style={styles.image}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              )
            )}
          </View>
          <View style={styles.audioActionsContainer}>
            {audioUrl && (
              <TouchableOpacity onPress={handlePlayAudio} style={styles.audioButton}>
                <Ionicons name="play-circle-outline" size={32} color={lightColors.primary} />
                <Text style={styles.audioButtonText}>Play Audio</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleHuggingFaceTranscription} style={styles.audioButton}>
              <Ionicons
                name={isTranscribing ? 'stop-circle-outline' : 'mic-outline'}
                size={32}
                color={isTranscribing ? lightColors.error : lightColors.primary}
              />
              <Text style={styles.audioButtonText}>
                {isTranscribing ? 'Stop Transcribing' : 'Start Transcribing'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={lightColors.primary} />
        </View>
      )}
      {!isKeyboardVisible && (
        <View style={styles.floatingTab}>
          <TouchableOpacity onPress={pickImage} style={styles.floatingButton}>
            <Ionicons name="image-outline" size={32} color={lightColors.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={recordAudioHandler} style={styles.floatingButton}>
            <Ionicons
              name={audioState.isRecording ? 'stop-circle-outline' : 'mic-outline'}
              size={32}
              color={audioState.isRecording ? lightColors.error : lightColors.secondary}
            />
          </TouchableOpacity>
        </View>
      )}
      {(audioState.isRecording || isTranscribing) && (
        <View style={styles.recordingIndicator}>
          <Ionicons name="radio" size={24} color={lightColors.error} />
          <Text style={styles.recordingText}>
            {audioState.isRecording ? 'Recording...' : 'Transcribing...'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  touchableContainer: {
    flex: 1,
  },
  buttonText: { 
    color: lightColors.accent, 
    fontFamily: 'firabold', 
    fontSize: 18 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 22, 
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    padding: 20,
    paddingBottom: 120
  },
  dateTime: { 
    color: lightColors.primary, 
    fontFamily: 'firamedium', 
    fontSize: 24, 
    marginHorizontal: 16 
  },
  dateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  textInput: { 
    padding: 4, 
    fontSize: 18, 
    fontFamily: 'firaregular', 
    marginBottom: 8, 
    marginHorizontal: 16, 
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 16, 
    marginBottom: 10 
  },
  picker: { 
    flex: 1, 
    height: 50 
  },
  pickerDropdown: { 
    borderBottomWidth: 1, 
    flex: 1, 
    borderColor: lightColors.primary 
  },
  customTagInput: { 
    borderBottomWidth: 1, 
    borderColor: lightColors.primary, 
    flex: 1, 
    padding: 14, 
    fontSize: 18, 
    fontFamily: 'firaregular', 
    marginLeft: 8 
  },
  pickerItem: { 
    fontFamily: 'firamedium', 
    fontSize: 16
  },
  addButton: { 
    backgroundColor: lightColors.primary, 
    padding: 10, 
    borderRadius: 5, 
    marginLeft: 10
  },
  addButtonText: { 
    color: lightColors.accent, 
    fontFamily: 'firaregular', 
    fontWeight: 'bold' 
  },
  tagContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 20, 
    marginHorizontal: 16
  },
  tag: { 
    backgroundColor: lightColors.accent, 
    marginVertical: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 5, 
    marginRight: 10
  },
  tagText: { 
    color: lightColors.secondary, 
    fontFamily: 'firamedium'
  },
  mediaContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 20, 
    marginHorizontal: 16
  },
  divider: { 
    width: 1, 
    height: '80%', 
    backgroundColor: lightColors.textLight, 
    marginHorizontal: 15
  },
  image: { 
    width: 100, 
    height: 100, 
    marginRight: 10, 
    marginBottom: 10, 
    borderRadius: 10
  },
  audioActionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginHorizontal: 16, 
    marginVertical: 12
  },
  audioButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  audioButtonText: { 
    marginLeft: 6, 
    color: lightColors.primary, 
    fontFamily: 'firamedium', 
    fontSize: 16
  },
  floatingTab: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightColors.accent,
    padding: 10,
    marginHorizontal: 96,
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 48, 
    height: 48
  },
  recordingIndicator: { 
    position: 'absolute', 
    bottom: 100, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(255, 0, 0, 0.1)', 
    padding: 10, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  recordingText: { 
    color: lightColors.error, 
    marginLeft: 8, 
    fontFamily: 'firamedium'
  },
  loadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000
  }
});

export default JournalEntryPage;
