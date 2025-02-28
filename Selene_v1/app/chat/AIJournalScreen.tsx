import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import lightColors from "@/src/constants/Colors";
import { fetchDataFromGrok } from "@/app/chat/grokapi";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/FirebaseConfig";

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function AIJournalScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const fetchSnippetsForToday = async () => {
    if (!currentUserId) return [];
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const snippetsRef = collection(db, `users/${currentUserId}/journals`);
    const q = query(
      snippetsRef,
      where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
      where("createdAt", "<", Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().text);
  };

  const handleSummarize = async () => {
    if (!currentUserId) {
      addBotMessage("Please sign in to access your journal entries.");
      return;
    }
  
    setIsLoading(true);
    try {
      const snippets = await fetchSnippetsForToday();
      
      if (snippets.length === 0) {
        addBotMessage("No journal entries found for today.");
        return;
      }
  
      // Create a more structured prompt for diary generation
      const prompt = `Convert these journal snippets into a proper diary entry for ${new Date().toLocaleDateString()}. 
      Include a meaningful title, organize thoughts into coherent paragraphs, and maintain the original sentiment.
      Use this format:
      
      **Title**: [Create an appropriate title]
      
      **Entries**:
      - [First entry summary]
      - [Second entry summary]
      
      **Highlights**: 
      - [Key moments from the day]
      
      **Reflections**:
      - [Thoughts and feelings]
      
      **Closing**: [Positive closing statement]
      
      Journal snippets:\n${snippets.join("\n")}`;
  
      const summary = await fetchDataFromGrok([{ role: "user", content: prompt }]);
      
      // Add formatted diary entry with timestamp
      addBotMessage(`📖 **Daily Diary - ${new Date().toLocaleDateString()}**\n\n${summary}`);
      
    } catch (error) {
      addBotMessage("Error generating diary entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const chatHistory: Array<{ role: "user" | "assistant"; content: string }> = 
        messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        }));

      const response = await fetchDataFromGrok([
        ...chatHistory,
        { role: "user", content: inputText }
      ]);

      addBotMessage(response);
    } catch (error) {
      addBotMessage("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.botText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Journal</Text>
        <Text style={styles.text}>Chat with your journals using AI</Text>
        
        <TouchableOpacity
          style={[styles.summarizeButton, !currentUserId && styles.disabledButton]}
          onPress={handleSummarize}
          disabled={!currentUserId || isLoading}
        >
          <Text style={styles.summarizeButtonText}>
            {isLoading ? "Processing..." : "Generate Summary"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        ListFooterComponent={
          isLoading && <Text style={styles.typingIndicator}>AI is typing...</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={24} color="white" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFFF",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    fontFamily: "firamedium",
  },
  text: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    fontFamily: "firamedium",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#093A3E",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    fontSize: 16,
    fontFamily: "firamedium",
  },
  userText: {
    color: "white",
  },
  botText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 15,
    elevation: 3,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#093A3E",
    padding: 12,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  summarizeButton: {
    backgroundColor: "#093A3E",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  summarizeButtonText: {
    color: "white",
    fontFamily: "firamedium",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  typingIndicator: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 10,
    fontFamily: "firaregular",
  },
});