import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '../../../FirebaseConfig';
import { fetchDataFromGrok } from './GrokApi';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const ChatSum = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed - User ID:', user.uid);
        setCurrentUserId(user.uid);
      } else {
        console.log('No user is signed in');
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSnippetsForToday = async () => {
    try {
      if (!currentUserId) {
        console.error('No user ID available');
        return [];
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);

      console.log('Debug Info:', {
        currentUserId,
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        startTimestamp: startTimestamp.toDate(),
        endTimestamp: endTimestamp.toDate()
      });

      const snippetsRef = collection(db, `users/${currentUserId}/journals`);
      const q = query(
        snippetsRef,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp)
      );

      const querySnapshot = await getDocs(q);
      console.log('Query Snapshot Size:', querySnapshot.size);

      const snippets = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Snippet Data:', data);
        snippets.push(data);
      });

      if (snippets.length === 0) {
        console.log('No snippets found with timestamp query, trying alternative method...');
        const allSnippetsQuery = await getDocs(snippetsRef);
        allSnippetsQuery.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt && data.createdAt.toDate) {
            const snippetDate = data.createdAt.toDate();
            if (snippetDate >= startOfDay && snippetDate <= endOfDay) {
              console.log('Found snippet with alternative method:', data);
              snippets.push(data);
            }
          }
        });
      }

      return snippets;
    } catch (error) {
      console.error('Error fetching snippets:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const formattedMessages = [
        ...messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userInput },
      ];

      const botResponse = await fetchDataFromGrok(formattedMessages);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentUserId) {
      setMessages(prev => [
        ...prev,
        { text: 'Please sign in to access your journal entries.', sender: 'bot' },
      ]);
      return;
    }

    try {
      console.log('Starting summarization for user:', currentUserId);
      setIsLoading(true);

      const snippets = await fetchSnippetsForToday();
      console.log('Fetched snippets:', snippets);

      if (snippets.length === 0) {
        setMessages(prev => [
          ...prev,
          { 
            text: `No journal entries found for today. (User ID: ${currentUserId}, Date: ${new Date().toISOString()})`,
            sender: 'bot'
          },
        ]);
        return;
      }

      const prompt = `Summarize the following journal entries:\n\n${snippets
        .map((snippet, index) => `${index + 1}. ${snippet.text}`)
        .join('\n')}\n\nGenerate a journal entry summarizing the day.`;

      console.log('Sending prompt to Grok:', prompt);
      const summary = await fetchDataFromGrok([{
        role: "user",
        content: prompt
      }]);

      setMessages(prev => [...prev, { text: summary, sender: 'bot' }]);
    } catch (error) {
      console.error('Error in handleSummarize:', error);
      setMessages(prev => [
        ...prev,
        { 
          text: `Unable to summarize journal entries. Please try again later. Error: ${error.message}`,
          sender: 'bot'
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClose = () => {
    setShowMenu(null);
  };

  return (
    <View style={styles.container}>
      {!currentUserId && (
        <View style={styles.authWarning}>
          <Text style={styles.authWarningText}>Please sign in to use </Text>
        </View>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.messageContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.botText
            ]}>
              {message.text}
            </Text>

            {message.sender === 'bot' && (
              <TouchableOpacity 
                onPress={() => setShowMenu(showMenu === index ? null : index)}
                style={styles.menuIcon}
              >
                <Icon name="more-vert" size={24} color="teal" />
              </TouchableOpacity>
            )}

            {showMenu === index && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleMenuClose}
                >
                  <Text style={styles.menuItemText}>Download as PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        
        {isLoading && (
          <Text style={styles.typingIndicator}>Processing...</Text>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={userInput}
          onChangeText={setUserInput}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
        >
          <Icon 
            name="send" 
            size={24} 
            color={!userInput.trim() || isLoading ? '#ccc' : 'teal'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.summarizeButtonContainer}>
        <TouchableOpacity
          style={[
            styles.summarizeButton,
            (!currentUserId || isLoading) && styles.summarizeButtonDisabled
          ]}
          onPress={handleSummarize}
          disabled={!currentUserId || isLoading}
        >
          <Text style={styles.summarizeButtonText}>
            {isLoading ? 'PROCESSING...' : 'JOURNALIZE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  authWarning: {
    backgroundColor: '#ffebee',
    padding: 10,
    alignItems: 'center',
  },
  authWarningText: {
    color: '#c62828',
    fontSize: 14,
  },
  messageContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'teal',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  menuIcon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  typingIndicator: {
    alignSelf: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  summarizeButtonContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingBottom: 10,
  },
  summarizeButton: {
    backgroundColor: 'teal',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    elevation: 2,
  },
  summarizeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  summarizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 150,
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
  },
});

export default ChatSum;