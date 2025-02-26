import React, { useState, useEffect } from "react";
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  FlatList, 
  StyleSheet, 
  StatusBar, 
  Keyboard,
  Animated 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FIRESTORE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
import { 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  query, 
  onSnapshot, 
  where, 
  updateDoc 
} from "firebase/firestore";
import { Snackbar, Checkbox } from "react-native-paper";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Clock } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import lightColors from "@/src/constants/Colors";
import { useRouter } from "expo-router";
import moment from "moment";

const TaskScreen1 = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showAppreciation, setShowAppreciation] = useState(false);
  const [appreciationMessage, setAppreciationMessage] = useState("");
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const fadeAnim = new Animated.Value(0);
  const router = useRouter();

  // Appreciation messages
  const appreciationMessages = [
    "You rock! 🚀",
    "Keep it up! 💪",
    "Amazing progress! 🌟",
    "You're on fire! 🔥",
    "Great job! 🎉"
  ];

  // Realtime listener for tasks
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(FIRESTORE_DB, "tasks"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => {
      showSnackbar("Error loading tasks");
    });
    return () => unsubscribe();
  }, [userId]);

  const addQuickTask = async () => {
    if (taskInput.trim()) {
      try {
        await addDoc(collection(FIRESTORE_DB, "tasks"), {
          task: taskInput,
          userId,
          completed: false,
          createdAt: new Date(),
          // Optionally, you can include reminderType and reminderTime here if needed
        });
        setTaskInput("");
        Keyboard.dismiss();
        showSnackbar("Task added successfully");
      } catch (error) {
        showSnackbar("Error adding task");
      }
    }
  };

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(FIRESTORE_DB, "tasks", id), { completed: !completed });
      if (!completed) showAppreciationMessage();
    } catch (error) {
      showSnackbar("Error updating task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, "tasks", id));
      showSnackbar("Task deleted");
    } catch (error) {
      showSnackbar("Error deleting task");
    }
  };

  const showAppreciationMessage = () => {
    const randomMessage = appreciationMessages[Math.floor(Math.random() * appreciationMessages.length)];
    setAppreciationMessage(randomMessage);
    setShowAppreciation(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowAppreciation(false));
      }, 2000);
    });
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);
  };

  const ProgressHeader = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total ? Math.round((completed / total) * 100) : 0;

    return (
      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{rate}% Complete</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${rate}%` }]} />
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity onPress={() => router.push(`/tasks/editTask?taskId=${item.id}`)}>
        <View style={styles.taskItem}>
          <Checkbox
            status={item.completed ? "checked" : "unchecked"}
            onPress={() => toggleTaskCompletion(item.id, item.completed)}
            color="#40E0D0"
          />
          <View style={styles.taskTextContainer}>
            <Text style={[styles.taskText, item.completed && styles.completedText]}>
              {item.task}
            </Text>
            <View style={styles.dueDateContainer}>
              <Clock size={12} color="#666" />
              <Text style={styles.dueDateText}>
                {item.createdAt && item.createdAt.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : "No date"}
              </Text>
            </View>
            {item.reminderType && item.reminderType !== "none" && item.reminderTime && (
              <View style={styles.reminderInfo}>
                <Ionicons name="alarm" size={14} color="#FF4500" />
                <Text style={styles.reminderText}>
                  {item.reminderType.charAt(0).toUpperCase() + item.reminderType.slice(1)} at{" "}
                  {item.reminderTime.toDate
                    ? moment(item.reminderTime.toDate()).format("LT")
                    : moment(item.reminderTime).format("LT")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ProgressHeader />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new task..."
          placeholderTextColor="#999"
          value={taskInput}
          onChangeText={setTaskInput}
          onSubmitEditing={addQuickTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addQuickTask}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
      {showAppreciation && (
        <Animated.View style={[styles.appreciationContainer, { opacity: fadeAnim }]}>
          <Text style={styles.appreciationText}>{appreciationMessage}</Text>
        </Animated.View>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        style={styles.snackbar}
        duration={2000}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFFF",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    marginBottom: 15,
    fontFamily: "firamedium",
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 15,
  },
  progressText: {
    color: "white",
    marginBottom: 8,
    fontSize: 16,
    fontFamily: "firamedium",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    margin: 20,
    borderRadius: 15,
    backgroundColor: "white",
    elevation: 3,
  },
  input: {
    flex: 1,
    padding: 18,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#093A3E",
    padding: 18,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 15,
    borderRadius: 12,
    elevation: 1,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  dueDateText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 6,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCCCB",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  reminderText: {
    color: "#FF4500",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    width: 80,
    alignItems: "center",
    marginVertical: 6,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
  },
  appreciationContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 5,
  },
  appreciationText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#40E0D0",
    fontFamily: "firamedium",
  },
  snackbar: {
    backgroundColor: "#323232",
    borderRadius: 8,
    margin: 20,
  },
  snackbarText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "firamedium",
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default TaskScreen1;
