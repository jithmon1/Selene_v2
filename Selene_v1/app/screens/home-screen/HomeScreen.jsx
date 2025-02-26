import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, Modal, Dimensions, Image } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, query, doc, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import CustomAppBar from './components/CustomAppbar';
import JournalEntryButton from './components/JournalEntryButton';
import JournalCalendar from './JournalCalender';
import TaskPage1 from './TaskPage1';
import ChatSum from './ChatSum';
import { Audio } from 'expo-av';

const Tab = createBottomTabNavigator();
const HEADER_HEIGHT = Dimensions.get('window').height * 0.3;

const HomeScreenContent = ({ navigation }) => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const user = FIREBASE_AUTH.currentUser;
  const userId = user?.uid;
  const swipeableRefs = useRef({});

  useEffect(() => {
    let unsubscribe;

    const setupJournalListener = () => {
      try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        const journalsCollectionRef = collection(userDocRef, 'journals');
        const q = query(journalsCollectionRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const journalEntries = [];
            snapshot.forEach((doc) => {
              journalEntries.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            setJournals(journalEntries);
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to journals:', error);
            Alert.alert('Error', 'Failed to load journal entries');
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up journal listener:', error);
        setLoading(false);
      }
    };

    if (userId) {
      setupJournalListener();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [userId]);

  const filterJournals = (query) => {
    return journals.filter((journal) =>
      journal.text.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleLongPress = async (journal) => {
    setSelectedJournal(journal);
    if (journal.audioUrl) {
      const { sound } = await Audio.Sound.createAsync({ uri: journal.audioUrl });
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true);
    }
    setModalVisible(true);
  };

  const handleDelete = async (journalId) => {
    try {
      const userDocRef = doc(FIRESTORE_DB, 'users', userId);
      const journalDocRef = doc(collection(userDocRef, 'journals'), journalId);
      await deleteDoc(journalDocRef);
      Alert.alert('Success', 'Journal entry deleted successfully');
    } catch (error) {
      console.error('Error deleting journal:', error);
      Alert.alert('Error', 'Failed to delete journal entry');
    }
  };

  const renderRightActions = (journalId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert(
          'Delete Entry',
          'Are you sure you want to delete this journal entry?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              onPress: () => handleDelete(journalId),
              style: 'destructive'
            },
          ]
        );
      }}
    >
      <Icon name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../../assets/images/DIARY.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      />
      <View style={styles.headerOverlay}>
        <Text style={styles.headerTitle}>My Journal</Text>
      </View>
    </View>
  );

  const renderJournalEntry = (journal) => (
    <Swipeable
      key={journal.id}
      ref={ref => swipeableRefs.current[journal.id] = ref}
      renderRightActions={() => renderRightActions(journal.id)}
      onSwipeableOpen={() => {
        Object.keys(swipeableRefs.current).forEach((key) => {
          if (key !== journal.id && swipeableRefs.current[key]) {
            swipeableRefs.current[key].close();
          }
        });
      }}
    >
      <TouchableOpacity
        onLongPress={() => handleLongPress(journal)}
        delayLongPress={500}
      >
        <View style={styles.journalCard}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.journalDate}>{journal.date}</Text>
            <Text style={styles.journalTime}>{journal.time}</Text>
          </View>
          <Text style={styles.journalText} numberOfLines={3}>
            {journal.text}
          </Text>
          <Text style={styles.createdAt}>
            Created: {journal.createdAt?.toDate().toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="teal" style={styles.loader} />
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {renderHeader()}
            <View style={styles.journalList}>
              {filterJournals(searchQuery).length > 0 ? (
                filterJournals(searchQuery).map((journal) => renderJournalEntry(journal))
              ) : (
                <Text style={styles.noJournalsText}>No journal entries found</Text>
              )}
            </View>
          </ScrollView>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            if (sound) {
              sound.unloadAsync();
              setIsPlaying(false);
            }
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalDate}>
                  {selectedJournal?.date} at {selectedJournal?.time}
                </Text>
                <Text style={styles.modalText}>{selectedJournal?.text}</Text>
                
                {selectedJournal?.images?.length > 0 && (
                  <Image
                    source={{ uri: selectedJournal.images[0] }}
                    style={styles.modalImage}
                  />
                )}
                
                {selectedJournal?.audioUrl && (
                  <TouchableOpacity
                    style={styles.playPauseButton}
                    onPress={async () => {
                      if (isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                      } else {
                        await sound.playAsync();
                        setIsPlaying(true);
                      }
                    }}
                  >
                    <Text style={styles.playPauseButtonText}>
                      {isPlaying ? 'Pause' : 'Play'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  if (sound) {
                    sound.unloadAsync();
                    setIsPlaying(false);
                  }
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <JournalEntryButton navigation={navigation} />
      </View>
    </GestureHandlerRootView>
  );
};

const HomeScreen = ({ navigation }) => {
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSearch = () => setIsSearch(!isSearch);
  const handleSearchChange = (text) => setSearchQuery(text);

  return (
    <View style={{ flex: 1 }}>
      <CustomAppBar 
        isSearch={isSearch} 
        toggleSearch={toggleSearch} 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Journal') iconName = 'book';
            else if (route.name === 'Calendar') iconName = 'event';
            else if (route.name === 'Chat') iconName = 'chat';
            else if (route.name === 'Tasks') iconName = 'check-circle';
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'teal',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 60 },
          tabBarLabelStyle: { fontSize: 12, paddingBottom: 6 },
        })}
      >
        <Tab.Screen 
          name="Journal" 
          component={HomeScreenContent}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={JournalCalendar} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Chat" 
          component={ChatSum} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Tasks" 
          component={TaskPage1} 
          options={{ headerShown: false }} 
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  journalList: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  journalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  journalTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  journalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalScrollView: {
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  modalDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 12,
    resizeMode: 'contain',
  },
  closeButton: {
    backgroundColor: 'teal',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  playPauseButton: {
    backgroundColor: 'teal',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noJournalsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
    marginTop: 30,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 24,
    color: 'gray',
  }
});

export default HomeScreen;
