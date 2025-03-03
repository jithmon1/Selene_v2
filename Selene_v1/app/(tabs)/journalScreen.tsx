import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ScrollView,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import SearchBar from '@/src/components/SearchBar';
import JournalButton from '@/src/components/JournalButton';
import moment from 'moment';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '@/src/constants/Colors';
import TagCarousel from '@/src/components/TagCards';
import { Video, ResizeMode } from 'expo-av';
import { doc, updateDoc, deleteDoc } from '@firebase/firestore';

const JournalScreen = () => {
  const router = useRouter();
  const { userData } = useUserData();
  const user = FIREBASE_AUTH.currentUser;
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
   // console.log('User Data:', userData);
  }, [userData]);

  // Helper to parse dates in the format "DD MMMM YYYY"
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split(' ');
    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };
    const monthIndex = monthMap[month];
    return new Date(year, monthIndex, parseInt(day, 10));
  };

  // Sort entries by date (most recent first)
  const sortedEntries = userData
    ? [...userData].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  // Extract unique tags from all entries (if available)
  const selectedTags = userData
    ?.flatMap((entry) => entry.tags || [])
    .filter((tag, index, self) => tag && self.indexOf(tag) === index);

  // Default: show recent entries (first three)
  const recentEntries = sortedEntries.slice(0, 6);

  // Enhanced search:
  // If searchQuery has 2 or more characters, filter the full list by title, content, or tags.
  // Otherwise, display the default recent entries.
  const displayedEntries =
    searchQuery.trim().length >= 2
      ? sortedEntries.filter((entry) => {
          const query = searchQuery.toLowerCase();
          return (
            entry.title.toLowerCase().includes(query) ||
            entry.content.toLowerCase().includes(query) ||
            (entry.tags &&
              entry.tags.some((tag) => tag.toLowerCase().includes(query)))
          );
        })
      : recentEntries;

  // Debug: log changes to search query and filtered count.
  useEffect(() => {
    // console.log('Search Query:', searchQuery);
    // console.log('Filtered entries count:', displayedEntries.length);
  }, [searchQuery, displayedEntries]);

  const handlePress = () => {
    router.push('/journals/JournalEntry');
  };

  const handleViewAllPress = () => {
    router.push('/journals/AllEntries');
  };
  const handleSearchPress = () => {
    router.push('/journals/SearchJournal');
  };

  // Render a single journal entry with media preview.
  const JournalEntryItem = ({ entry }) => {
    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => setSelectedEntry(entry)}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entryDate}>
            {entry.date} 
          </Text>
        </View>
        <Text style={styles.entryContent} numberOfLines={2}>
          {entry.content}
        </Text>
        {entry.media && entry.media.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaScroll}
          >
            {entry.media.map((mediaItem, index) =>
              mediaItem.type === 'image' ? (
                <Image
                  key={index}
                  source={{ uri: mediaItem.url }}
                  style={styles.mediaThumbnail}
                />
              ) : (
                <Video
                  key={index}
                  source={{ uri: mediaItem.url }}
                  style={styles.mediaThumbnail}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              )
            )}
          </ScrollView>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        data={displayedEntries}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <>
                        <TouchableOpacity onPress={handleSearchPress}>

            <View style={styles.searchContainer}>
                <SearchBar/>
            </View>
            </TouchableOpacity>

            <View style={styles.tagContainer}>
              <TagCarousel tags={selectedTags} />
            </View>
            <JournalButton
              title="Create New Journal Entry"
              onPress={handlePress}
            />
            {userData && userData.length > 0 && (
              <View style={styles.journalHeader}>
                <Text style={styles.userDataText}>Recent Entries :</Text>
                <TouchableOpacity
                  onPress={handleViewAllPress}
                  style={styles.viewAllButton}
                >
                  <View style={styles.viewAllContent}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={lightColors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <JournalEntryItem entry={item} />}
        ListEmptyComponent={
          <Text style={styles.noEntriesText}>
            No journal entries available
          </Text>
        }
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Modal for Journal Detail */}
      {selectedEntry && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={selectedEntry !== null}
          onRequestClose={() => setSelectedEntry(null)}
        >
          <JournalDetail
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const JournalDetail = ({ entry, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Update the journal entry in Firestore.
  const handleSaveEdit = async () => {
    try {
      setIsProcessing(true);
      const userId =
        entry.userId ||
        (FIREBASE_AUTH.currentUser && FIREBASE_AUTH.currentUser.uid);
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const entryRef = doc(
        FIRESTORE_DB,
        'users',
        userId,
        'journals',
        entry.id
      );
      await updateDoc(entryRef, { title, content });
      Alert.alert('Success', 'Journal entry updated successfully');
      setIsEditing(false);
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error updating journal entry:', error);
      Alert.alert('Error', 'Failed to update journal entry');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete the journal entry from Firestore.
  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const userId =
                entry.userId ||
                (FIREBASE_AUTH.currentUser && FIREBASE_AUTH.currentUser.uid);
              if (!userId) {
                Alert.alert('Error', 'User not authenticated');
                return;
              }
              const entryRef = doc(
                FIRESTORE_DB,
                'users',
                userId,
                'journals',
                entry.id
              );
              await deleteDoc(entryRef);
              Alert.alert('Success', 'Journal entry deleted successfully');
              onClose(); // Close modal after deletion
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={detailStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={detailStyles.content}>
        <View style={detailStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={lightColors.primary}
            />
          </TouchableOpacity>
          <Text style={detailStyles.headerTitle}>Journal Detail</Text>
          <View style={detailStyles.headerButtons}>
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={detailStyles.headerButton}
              >
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={lightColors.primary}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              style={detailStyles.headerButton}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={lightColors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={detailStyles.fieldContainer}>
          <Text style={detailStyles.label}>Title:</Text>
          {isEditing ? (
            <TextInput
              style={detailStyles.input}
              value={title}
              onChangeText={setTitle}
            />
          ) : (
            <Text style={detailStyles.value}>{title}</Text>
          )}
        </View>
        <View style={detailStyles.fieldContainer}>
          <Text style={detailStyles.label}>Content:</Text>
          {isEditing ? (
            <TextInput
              style={[detailStyles.input, { height: 100 }]}
              value={content}
              onChangeText={setContent}
              multiline
            />
          ) : (
            <Text style={detailStyles.value}>{content}</Text>
          )}
        </View>
        {entry.media && entry.media.length > 0 && (
          <View style={detailStyles.mediaContainer}>
            <Text style={detailStyles.label}>Media:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={detailStyles.mediaScroll}
            >
              {entry.media.map((mediaItem, index) =>
                mediaItem.type === 'image' ? (
                  <Image
                    key={index}
                    source={{ uri: mediaItem.url }}
                    style={detailStyles.mediaFull}
                  />
                ) : (
                  <Video
                    key={index}
                    source={{ uri: mediaItem.url }}
                    style={detailStyles.mediaFull}
                    useNativeControls
                    resizeMode="cover"
                    isLooping
                  />
                )
              )}
            </ScrollView>
          </View>
        )}
        {isEditing && (
          <View style={detailStyles.editButtonsContainer}>
            <TouchableOpacity
              onPress={handleSaveEdit}
              style={detailStyles.saveButton}
              disabled={isProcessing}
            >
              <Text style={detailStyles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // Reset fields to original data on cancel
                setTitle(entry.title);
                setContent(entry.content);
                setIsEditing(false);
              }}
              style={detailStyles.cancelButton}
              disabled={isProcessing}
            >
              <Text style={detailStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {isProcessing && (
        <View style={detailStyles.processingOverlay}>
          <ActivityIndicator size="large" color={lightColors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { padding: 16 },
  searchContainer: { marginBottom: 8 },
  tagContainer: { marginBottom: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  userDataText: { fontSize: 16, fontWeight: 'bold' },
  viewAllButton: { alignItems: 'center' },
  viewAllText: { fontSize: 16, color: lightColors.primary },
  viewAllContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noEntriesText: { textAlign: 'center', marginTop: 20, color: '#666' },
  entryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryTitle: { fontSize: 18, fontWeight: 'bold', color: lightColors.primary },
  entryDate: { fontSize: 12, color: '#666' },
  entryContent: { fontSize: 14, color: '#333', marginVertical: 6 },
  mediaScroll: { marginTop: 8 },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: { flexDirection: 'row' },
  headerButton: { marginLeft: 12 },
  fieldContainer: { marginBottom: 16 },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightColors.primary,
    marginBottom: 4,
  },
  value: { fontSize: 16, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    color: '#333',
  },
  mediaContainer: { marginBottom: 16 },
  mediaScroll: { marginTop: 8 },
  mediaFull: { width: 200, height: 200, borderRadius: 8, marginRight: 12 },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: lightColors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: lightColors.error,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JournalScreen;
