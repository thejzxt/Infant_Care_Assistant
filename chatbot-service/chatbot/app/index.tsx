import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";

// Define the structure for messages
type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Create the user's message object
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input
    };

    // 2. Update UI with the user's message immediately
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 3. Connect to the FastAPI Backend
      // NOTE: Use your computer's IP address instead of 127.0.0.1 if testing on a real phone
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: "parent_session_001", // FIXED: Added user_id to satisfy FastAPI requirement
          message: userMsg.text 
        })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      // 4. Update UI with the Bot's reply
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      // 5. Error Handling
      console.error("Fetch Error:", e);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: "bot",
          text: "❌ Connection failed. Check if the FastAPI server is running."
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Infant Care Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "user"
                  ? styles.userText
                  : styles.botText
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Assistant is thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your baby..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage} // Allows sending via "Enter" key
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e3a8a" // Professional blue background
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#1e40af",
    borderBottomWidth: 1,
    borderBottomColor: "#1d4ed8"
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  message: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    maxWidth: "85%"
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 2
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderBottomLeftRadius: 2
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: "#fff"
  },
  botText: {
    color: "#1f2937"
  },
  loadingContainer: {
    padding: 10
  },
  loadingText: {
    textAlign: "center",
    color: "#bfdbfe",
    fontStyle: "italic",
    fontSize: 14
  },
  inputRow: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000"
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#2563eb",
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: "center",
    elevation: 2 // Shadow for Android
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});