import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '../constants/Colors';
import { FIRESTORE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

interface Task {
  id: string;
  task: string;
  createdAt?: any; // Firestore timestamp or Date
  completed: boolean;
}

interface TasksComponentProps {
  selectedDate?: Date | string;
}

const TasksComponent: React.FC<TasksComponentProps> = ({ selectedDate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Convert selectedDate to a Date object if provided
  const selectedDateObj =
    selectedDate && !(selectedDate instanceof Date)
      ? new Date(selectedDate)
      : selectedDate || null;

  // Fetch tasks in real time from Firebase and filter by selectedDate if provided
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(FIRESTORE_DB, 'tasks'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Task[];

      const filteredTasks = selectedDateObj
        ? fetchedTasks.filter(task => {
            if (!task.createdAt) return false;
            const taskDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            return (
              taskDate.getFullYear() === selectedDateObj.getFullYear() &&
              taskDate.getMonth() === selectedDateObj.getMonth() &&
              taskDate.getDate() === selectedDateObj.getDate()
            );
          })
        : fetchedTasks;

      setTasks(filteredTasks);
    });
    return () => unsubscribe();
  }, [userId, selectedDateObj]);

  // Toggle task completion status in Firebase
  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      const taskRef = doc(FIRESTORE_DB, 'tasks', id);
      await updateDoc(taskRef, { completed: !currentStatus });
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Goals</Text>
      {tasks.length > 0 ? (
        <View style={styles.taskListContainer}>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleTask(item.id, item.completed)} style={styles.taskItem}>
                <Ionicons
                  name={item.completed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={item.completed ? lightColors.primary : 'gray'}
                />
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.task}
                </Text>
              </TouchableOpacity>
            )}
            scrollEnabled={true}
          />
        </View>
      ) : (
        <View style={styles.noTasksContainer}>
          <Ionicons name="calendar-clear-outline" size={40} color="gray" />
          <Text style={styles.noTasksText}>No tasks for today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    elevation: 3,
    height: 200,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'firamedium',
  },
  taskListContainer: {
    height: 130,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taskText: {
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'firamedium',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  noTasksContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  noTasksText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'firamedium',
  },
});

export default TasksComponent;
