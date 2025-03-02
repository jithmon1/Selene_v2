import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '../constants/Colors';

const TasksComponent = ({ selectedDate }) => {
  // Hardcoded sample tasks for testing
  const [tasksForToday, setTasksForToday] = useState([
    { id: 1, task: 'Complete journal entry', date: selectedDate, completed: false },
    { id: 2, task: 'Review daily goals', date: selectedDate, completed: false },
    { id: 3, task: 'Exercise for 30 minutes', date: selectedDate, completed: false },
    { id: 4, task: 'Read a book', date: selectedDate, completed: false },
    { id: 5, task: 'Plan tomorrow’s schedule', date: selectedDate, completed: false },
    { id: 6, task: 'Meditate for 10 minutes', date: selectedDate, completed: false },
    { id: 7, task: 'Drink 8 glasses of water', date: selectedDate, completed: false },
  ]);

  // Toggle task completion
  const toggleTask = (id) => {
    setTasksForToday((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Goals</Text>

      {tasksForToday.length > 0 ? (
        <View style={styles.taskListContainer}>
          <FlatList
            data={tasksForToday}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.taskItem}>
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
            scrollEnabled={true} // Ensures the list is scrollable
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
    height: 200, // Keeps the component fixed
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'firamedium',
  },
  taskListContainer: {
    height: 130, // Fixed height for the scrollable list
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
