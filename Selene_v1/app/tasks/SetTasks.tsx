import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FIRESTORE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { Snackbar, FAB } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const SetTask = () => {
  const [taskInput, setTaskInput] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [reminderType, setReminderType] = useState("none");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  const addTask = async () => {
    if (taskInput.trim() === "") return;
    try {
      await addDoc(collection(FIRESTORE_DB, "tasks"), { 
        task: taskInput, 
        dueDate,
        reminderType,
        reminderTime,
        userId,
        completed: false 
      });
      setSnackbarVisible(true);
      setTaskInput("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#008080", "#20B2AA"]} 
        style={styles.header}
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerText}>New Task</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Task description"
          placeholderTextColor="#666"
          value={taskInput}
          onChangeText={setTaskInput}
        />

        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="date-range" size={20} color="white" />
          <Text style={styles.buttonText}> Set Due Date</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date);
            }}
          />
        )}

        <Text style={styles.sectionHeader}>Reminder Settings</Text>
        
        <View style={styles.reminderContainer}>
          {["none", "daily", "weekly", "custom"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.reminderButton,
                reminderType === type && styles.selectedReminder,
              ]}
              onPress={() => {
                setReminderType(type);
                if (type === "custom") setShowTimePicker(true);
              }}
            >
              <Text
                style={[
                  styles.reminderText,
                  reminderType === type && styles.selectedReminderText,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {reminderType === "custom" && showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setReminderTime(time);
            }}
          />
        )}
      </ScrollView>
      <FAB style={styles.fab} icon="check" onPress={addTask} />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Task Added
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20B2AA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  reminderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reminderButton: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedReminder: {
    backgroundColor: "#008080",
    borderWidth: 1,
    borderColor: "#006666",
  },
  reminderText: {
    fontSize: 16,
    color: "#333",
  },
  selectedReminderText: {
    color: "white",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#008080",
  },
  snackbar: {
    backgroundColor: "#323232",
  },
});

export default SetTask;
