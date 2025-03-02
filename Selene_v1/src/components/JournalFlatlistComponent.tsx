import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import lightColors from '@/src/constants/Colors';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const JournalsComponent = ({ entries }) => {
  const router = useRouter();

  return (
    <View style={[styles.container, { height: height * 0.35 }]}>
      <Text style={styles.heading}>Your Journals</Text>
      {entries?.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.journalCard, { width: width * 0.75, height: height * 0.3 }]}
              onPress={() => router.push(`/journals/${item.id}`)}
            >
              <Text style={styles.journalTitle}>{item.title}</Text>
              <Text style={styles.journalContent}>
              {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
              </Text>
              {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>{tag}</Text>
              ))}
            </View>
          )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noEntriesText}>No journal entries for this date.</Text>
      )}
    </View>
  );
};



export default JournalsComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 10,
  },
  journalCard: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginHorizontal: 8,
    borderRadius: 15,
    shadowColor: lightColors.primary,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    
  },
  journalTitle: {
    color: lightColors.primary,
    fontSize: 26,
    fontFamily: 'firabold',
  },
  journalContent: {
    color: lightColors.textPrimary,
    fontSize: 16,
    fontFamily: 'firaregular',
    marginTop: 5,
  },
  noEntriesText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: lightColors.accent,
    marginVertical: 8,
    padding: 5,
    color: lightColors.secondary,
    borderRadius: 5,
    marginRight: 10,
  },
  tagText: {
    color: '#ffff',
    fontFamily: 'firamedium',
  },
});
