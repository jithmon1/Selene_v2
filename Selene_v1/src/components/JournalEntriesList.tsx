import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { JournalEntry } from '@/src/constants/Types'; // Adjust the import path as necessary
import lightColors from '../constants/Colors';

interface JournalEntriesListProps {
  entries: JournalEntry[];
}

const JournalEntriesList: React.FC<JournalEntriesListProps> = ({ entries }) => {
  const router = useRouter();

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.journalContainer}
      onPress={() => {
        router.push(`/journals/${item.id}`);
      }}
    >
      <View style={styles.journalFlex}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        <Text style={styles.journalDate}>{item.date}</Text>
      </View>
      <Text style={styles.journalContent} numberOfLines={2}>{item.content}</Text>

      {/* Images - Display as small thumbnails */}
      {item.images?.length > 0 && (
        <View style={styles.imagesContainer}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.journalImage} />
          ))}
        </View>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 16,
  },
  journalContainer: {
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journalFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalTitle: {
    fontSize: 18,
    color: lightColors.primary,
    marginBottom: 4,
    fontFamily: 'firamedium',
  },
  journalDate: {
    fontSize: 14,
    color: 'gray',
  },
  journalContent: {
    fontSize: 16,
    fontFamily: 'firaregular',
    marginBottom: 6,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  journalImage: {
    width: 80,
    height: 60,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tag: {
    backgroundColor: lightColors.accent,
    color: '#fff',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
    fontSize: 12,
  },
});

export default JournalEntriesList;
