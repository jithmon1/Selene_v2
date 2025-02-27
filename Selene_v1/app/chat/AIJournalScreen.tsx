import React, { useState } from "react";
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

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function AIJournalScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    Keyboard.dismiss();

    // Simulate a bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "This is a sample response from the AI. Integrate your chatbot API here!",
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
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
      {/* Header */}
      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Journal</Text>
        <Text style={styles.text}>chat with your journals with AI</Text>
      </LinearGradient>

      {/* Chat messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={24} color="white" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFFF", // Light turquoise background
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
    paddingBottom: 80, // Extra space for the input area
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#093A3E", // Dark tone similar to your task add button
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
});
