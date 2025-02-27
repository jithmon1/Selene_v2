import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FIRESTORE_DB } from "@/FirebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import lightColors from "@/src/constants/Colors";

const EditTask = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams(); // Expect route: /tasks/editTask?taskId=xxx

  // State for task text and reminder fields
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [reminderType, setReminderType] = useState("none");
  // Initialize reminderTime (this will be overwritten if the task has a saved reminder)
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        Alert.alert("Error", "No task selected.");
        router.back();
        return;
      }
      try {
        const taskRef = doc(FIRESTORE_DB, "tasks", taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const data = taskSnap.data();
          setTask(data.task || "");
          // Support both Firestore Timestamp or Date values
          setDueDate(
            data.dueDate
              ? (data.dueDate.toDate ? data.dueDate.toDate() : new Date(data.dueDate))
              : new Date()
          );
          setReminderType(data.reminderType || "none");
          setReminderTime(
            data.reminderTime
              ? (data.reminderTime.toDate ? data.reminderTime.toDate() : new Date(data.reminderTime))
              : new Date()
          );
        } else {
          Alert.alert("Error", "Task not found.");
          router.back();
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load task.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSave = async () => {
    if (!task.trim()) {
      Alert.alert("Validation", "Task cannot be empty.");
      return;
    }
    setUpdating(true);
    try {
      const taskRef = doc(FIRESTORE_DB, "tasks", taskId);
      await updateDoc(taskRef, {
        task: task.trim(),
        dueDate: dueDate,
        reminderType: reminderType,
        // Only store reminderTime if a reminder is set
        reminderTime: reminderType !== "none" ? reminderTime : null,
      });
      Alert.alert("Success", "Task updated successfully.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update task.");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const taskRef = doc(FIRESTORE_DB, "tasks", taskId);
              await deleteDoc(taskRef);
              Alert.alert("Deleted", "Task deleted successfully.");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete task.");
              console.error(error);
            }
          } 
        }
      ]
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
    <View style={styles.container}>
      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerIcon}>
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.content}>
        <Text style={styles.label}>Task</Text>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          multiline
        />
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.dateButtonText}>{moment(dueDate).format("LL")}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) setDueDate(date);
            }}
          />
        )}
        <Text style={styles.label}>Reminder Settings</Text>
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
                // When selecting "custom", show the time picker without resetting reminderTime
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
            onChange={(event, selectedTime) => {
              // For iOS, keep showing the picker; for others, hide after selection.
              setShowTimePicker(Platform.OS === "ios");
              if (selectedTime) {
                setReminderTime(selectedTime);
              }
            }}
          />
        )}
        {reminderType !== "none" && (
          <View style={styles.reminderInfoDisplay}>
            <Ionicons name="alarm" size={16} color="#FF4500" />
            <Text style={styles.reminderInfoText}>
              Reminder:{" "}
              {reminderType.charAt(0).toUpperCase() + reminderType.slice(1)}
              {reminderType === "custom" && ` at ${moment(reminderTime).format("LT")}`}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updating}>
          <Text style={styles.saveButtonText}>
            {updating ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerIcon: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "white",
    fontFamily: "firamedium",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontFamily: "firaregular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "white",
    marginBottom: 20,
    fontFamily: "firaregular",
    textAlignVertical: "top",
    minHeight: 100,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20B2AA",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  dateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
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
  reminderInfoDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  reminderInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#FF4500",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#093A3E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "firamedium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
