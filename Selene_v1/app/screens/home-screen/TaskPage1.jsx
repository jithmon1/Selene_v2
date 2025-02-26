import React, { useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View, FlatList, StyleSheet, Alert } from "react-native";
import { FIRESTORE_DB, FIREBASE_AUTH } from '@/FirebaseConfig'; // Import firebaseConfig
import { collection, addDoc, updateDoc, doc, deleteDoc, query, getDocs, where } from "firebase/firestore"; 

const TaskPage1 = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const userId = FIREBASE_AUTH.currentUser?.uid; // Get current user's UID

  // Fetch tasks from Firestore when the component mounts
  useEffect(() => {
    if (userId) {
      const fetchTasks = async () => {
        const q = query(collection(FIRESTORE_DB, "tasks"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        setTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchTasks();
    }
  }, [userId]);

  // Add or edit task
  const addOrEditTask = async () => {
    if (taskInput.trim()) {
      if (editingTaskId) {
        const taskRef = doc(FIRESTORE_DB, "tasks", editingTaskId);
        await updateDoc(taskRef, { task: taskInput });
        setEditingTaskId(null);
      } else {
        await addDoc(collection(FIRESTORE_DB, "tasks"), {
          task: taskInput,
          userId: userId, // Associate task with the user
        });
      }
      setTaskInput("");
      loadTasks();
    }
  };

  // Remove task
  const removeTask = async (id) => {
    await deleteDoc(doc(FIRESTORE_DB, "tasks", id));
    loadTasks();
  };

  // Edit task
  const editTask = (id, taskText) => {
    setTaskInput(taskText);
    setEditingTaskId(id);
  };

  // Reload tasks after adding/removing
  const loadTasks = async () => {
    if (userId) {
      const q = query(collection(FIRESTORE_DB, "tasks"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      setTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Get Things Done!</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="What is the task today?"
          placeholderTextColor="#6e6e6e"
          value={taskInput}
          onChangeText={setTaskInput}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.addButton} onPress={addOrEditTask}>
          <Text style={styles.buttonText}>{editingTaskId ? "Edit" : "Add"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.task}</Text>
            <View style={styles.taskActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => editTask(item.id, item.task)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => removeTask(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#d3d3d3",
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FFCC00",
    padding: 10,
    borderRadius: 5,
    color: "#333",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#008080",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskItem: {
    flexDirection: "column",
    backgroundColor: "#008080",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: {
    color: "#fff",
    flex: 1,
    marginBottom: 10,
  },
  taskActions: {
    flexDirection: "column",
    alignItems: "center",
  },
  actionButton: {
    marginTop: 5,
  },
  editText: {
    color: "#ffdd00",
    fontWeight: "bold",
  },
  deleteText: {
    color: "#ff4d4d",
    fontWeight: "bold",
  },
});

export default TaskPage1;
