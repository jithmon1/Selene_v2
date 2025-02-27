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
import { Checkbox } from "react-native-paper";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Clock } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import lightColors from "@/src/constants/Colors";
import { useRouter } from "expo-router";
import moment from "moment";
import * as Notifications from "expo-notifications";

// Set up the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TaskScreen1 = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [showAppreciation, setShowAppreciation] = useState(false);
  const [appreciationMessage, setAppreciationMessage] = useState("");
  const [progressSubtitle, setProgressSubtitle] = useState("Hey, remember your task, silly?");
  
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const fadeAnim = new Animated.Value(0);
  const router = useRouter();

  // Ten random completion messages (for when marking a task complete)
  const completionMessages = [
    "Task Conquered, Victory Awaits! 🎖️",
    "Another One Down: Keep Shining! ✨",
    "You did it, champion! 🏆",
    "Another task bites the dust! 😎",
    "Crushing it, one task at a time! 🔥",
    "Task Completed: Onward and Upward! 🚀",
    "You're a task-crushing machine! 🤖",
    "Job well done, superstar! 🌟",
    "Task finished: You're on fire! 🔥",
    "Another milestone achieved! 🎉"
  ];

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications not granted!");
      }
    })();
  }, []);

  // Listen for notification responses; on tap, navigate to the task's edit screen
  // so the user can manually delete (cut off) the task.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.taskId) {
        router.push(`/tasks/editTask?taskId=${data.taskId}`);
      }
    });
    return () => subscription.remove();
  }, []);

  // Realtime listener for tasks
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(FIRESTORE_DB, "tasks"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [userId]);

  // Schedule notifications for tasks with reminders.
  // Cancel all previously scheduled notifications to prevent duplicates.
  useEffect(() => {
    (async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      tasks.forEach(async (task) => {
        if (
          !task.completed &&
          task.reminderType &&
          task.reminderType !== "none" &&
          task.reminderTime
        ) {
          const reminderDate = task.reminderTime.toDate ? task.reminderTime.toDate() : new Date(task.reminderTime);
          if (reminderDate > new Date()) {
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Task Reminder",
                  body: task.task,
                  data: { taskId: task.id },
                },
                trigger: reminderDate,
              });
            } catch (error) {
              console.error("Error scheduling notification:", error);
            }
          }
        }
      });
    })();
  }, [tasks]);

  const addQuickTask = async () => {
    if (taskInput.trim()) {
      try {
        await addDoc(collection(FIRESTORE_DB, "tasks"), {
          task: taskInput,
          userId,
          completed: false,
          createdAt: new Date(),
        });
        setTaskInput("");
        Keyboard.dismiss();
        // Do not change the subtitle on adding a task.
      } catch (error) {
        // No snackbar message as requested.
      }
    }
  };

  // Toggle task completion:
  // - If marking an incomplete task as complete, show an appreciation message and update subtitle.
  // - If unticking (marking complete -> incomplete), do nothing to the subtitle.
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(FIRESTORE_DB, "tasks", id), { completed: !completed });
      if (!completed) {
        // Only when marking incomplete -> complete:
        const randomMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
        // After a short delay, check if progress is 100%.
        setTimeout(() => {
          const total = tasks.length;
          const completedCount = tasks.filter(t => t.completed).length + 1; // +1 because we just toggled one to complete.
          const rate = total ? Math.round((completedCount / total) * 100) : 0;
          if (rate === 100 && total > 0) {
            setProgressSubtitle("Mission Accomplished: You're Unstoppable! 💪");
          } else {
            setProgressSubtitle(randomMsg);
          }
        }, 500);
        showAppreciationMessage(randomMsg);
      }
    } catch (error) {
      // No snackbar message as requested.
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, "tasks", id));
      // Do not update subtitle when deleting a task.
    } catch (error) {
      // Do nothing
    }
  };

  const showAppreciationMessage = (msg: string) => {
    setAppreciationMessage(msg);
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

  // Header with title "Selene" and dynamic subtitle (only updated when a task is marked complete or when progress reaches 100%)
  const ProgressHeader = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return (
      <LinearGradient
        colors={[lightColors.primary, lightColors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Selene</Text>
        <Text style={styles.headerSubtitle}>{progressSubtitle}</Text>
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
                  {item.reminderType === "custom"
                    ? moment(item.reminderTime.toDate ? item.reminderTime.toDate() : item.reminderTime).format("LT")
                    : item.reminderType.charAt(0).toUpperCase() + item.reminderType.slice(1) + " at " +
                      moment(item.reminderTime.toDate ? item.reminderTime.toDate() : item.reminderTime).format("LT")}
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
    fontSize: 28,
    color: "white",
    fontWeight: "600",
    fontFamily: "firamedium",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 15,
    fontFamily: "firaregular",
    textAlign: "center",
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
  listContent: {
    paddingBottom: 100,
  },
});

export default TaskScreen1;
