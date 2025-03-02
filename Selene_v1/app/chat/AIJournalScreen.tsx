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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import lightColors from "@/src/constants/Colors";
import { fetchDataFromGrok } from "@/app/chat/grokapi";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/FirebaseConfig";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSummaryDate, setSelectedSummaryDate] = useState(moment().toDate());
  const [allJournals, setAllJournals] = useState<any[]>([]);

  // Identity response configuration
  const identityTriggers = [
    "who are you",
    "what are you",
    "who created you",
    "what is your purpose",
    "what can you do"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        const journals = await fetchAllJournals(user.uid);
        setAllJournals(journals);
      } else {
        setCurrentUserId(null);
        setAllJournals([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAllJournals = async (userId: string) => {
    try {
      const journalsRef = collection(db, `users/${userId}/journals`);
      const querySnapshot = await getDocs(journalsRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching all journals:", error);
      return [];
    }
  };

  const fetchSnippetsForDate = async (date: Date) => {
    if (!currentUserId) return [];
    
    const targetDate = moment(date).format("DD MMMM YYYY");
    
    try {
      const journalsRef = collection(db, `users/${currentUserId}/journals`);
      const q = query(journalsRef, where("date", "==", targetDate));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.title || "Untitled Entry",
          content: data.content || "",
          time: data.time || "No time",
          tags: data.tags || [],
          date: data.date,
          media: data.media || [],
          audioUrl: data.audioUrl || ""
        };
      });
    } catch (error) {
      console.error("Error fetching snippets:", error);
      return [];
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (event.type === "set" && date) {
      setSelectedSummaryDate(date);
      setShowDatePicker(false);
      handleSummarize(date);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleDateSelectionToday = () => {
    const today = moment().toDate();
    setSelectedSummaryDate(today);
    setShowModal(false);
    handleSummarize(today);
  };

  const handleDateSelectionOther = () => {
    setShowModal(false);
    setShowDatePicker(true);
  };

  const handleSummarize = async (date?: Date) => {
    if (!currentUserId) {
      addBotMessage("Please sign in to access your journal entries.");
      return;
    }

    setIsLoading(true);
    try {
      const targetDate = date || selectedSummaryDate;
      const snippets = await fetchSnippetsForDate(targetDate);
      
      if (snippets.length === 0) {
        addBotMessage(`No journal entries found for ${moment(targetDate).format("DD MMMM YYYY")}.`);
        return;
      }

      const formattedSnippets = snippets.map((snippet, index) => 
        ` ${snippet.time}\n` +
        ` ${snippet.title}\n` +
        `${snippet.content}\n` +
        ` Tags: ${snippet.tags.join(", ") || "None"}\n` +
        (snippet.media?.length ? ` ${snippet.media.length} media items\n` : "") +
        (snippet.audioUrl ? ` Audio recording available\n` : "") +
        `────────────────────`
      ).join("\n\n");

      const prompt = `Create a comprehensive daily journal summary from these entries:\n\n` +
        `Date: ${moment(targetDate).format("DD MMMM YYYY")}\n\n` +
        `${formattedSnippets}\n\n` +
        `Format the summary with:\n` +
        `1. A meaningful title\n` +
        `2. Key highlights\n` +
        `3. Emotional analysis\n` +
        `4. Tag trends\n` +
        `5. Media/audio insights\n` +
        `Summarize the following journal entries:\n\n${snippets
        .map((snippet, index) => `${index + 1}. ${snippet.text}`)
        .join('\n')}\n\nGenerate a journal entry summarizing the day.`;

      const summary = await fetchDataFromGrok([{ role: "user", content: prompt }]);
      
      addBotMessage(` **Journal Summary - ${moment(targetDate).format("DD MMMM YYYY")}**\n\n${summary}`);
      
    } catch (error) {
      console.error("Summary generation error:", error);
      addBotMessage("Error generating summary. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

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
      // Check for identity questions first
      const cleanInput = inputText.trim().toLowerCase();
      if (identityTriggers.some(trigger => cleanInput.includes(trigger))) {
        addBotMessage("I'm Selene AI, an AI bot built on top of this platform Selene. I help you get detailed reports of your journals, recollect your journal points, and many more. Tell me what should I do for you?");
        setIsLoading(false);
        return;
      }

      const journalContext = allJournals.length > 0 
        ? "Journal Context:\n" + allJournals.map(j => 
            `[${j.date}] ${j.title}\n${j.content}\nTags: ${j.tags?.join(", ") || "None"}`
          ).join("\n\n")
        : "No journal entries available for context";

      const prompt = `${journalContext}\n\nQuestion: ${inputText}\n\n` +
        "Answer using the journal context if relevant. If not, respond politely that " +
        "the information isn't available in the journal history.";

      const chatHistory = messages.map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetchDataFromGrok([
        ...chatHistory,
        { role: "user", content: prompt }
      ]);

      addBotMessage(response);
    } catch (error) {
      console.error("Chat error:", error);
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
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Summary Date</Text>
            
            <TouchableOpacity 
              style={styles.dateOption}
              onPress={handleDateSelectionToday}
            >
              <Text style={styles.dateOptionText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateOption}
              onPress={handleDateSelectionOther}
            >
              <Text style={styles.dateOptionText}>Choose Specific Date</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={selectedSummaryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Journal</Text>
        <Text style={styles.text}>Chat with your journals using AI</Text>
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

      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => setShowModal(true)}
        disabled={!currentUserId || isLoading}
      >
        <Text style={styles.generateButtonText}>
          {isLoading ? "Processing..." : "Generate Journal"}
        </Text>
      </TouchableOpacity>
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
    lineHeight: 22,
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
  generateButton: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: lightColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  generateButtonText: {
    color: "white",
    fontFamily: "firamedium",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "firamedium",
    textAlign: "center",
    marginBottom: 20,
  },
  dateOption: {
    backgroundColor: lightColors.primary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  dateOptionText: {
    color: "white",
    fontFamily: "firamedium",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: lightColors.error,
    fontFamily: "firamedium",
  },
});