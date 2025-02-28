import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import lightColors from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import RealSearchBar from '@/src/components/RealSearchBar';
import { useUserData } from '../providers/UserDataProvider';

const SearchJournal = () => {
  const router = useRouter();
  const { userData } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    router.back();
  };

  const filteredEntries = userData
    ? userData.filter((entry) => {
        const query = searchQuery.toLowerCase();
        return (
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          (entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      })
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <AntDesign name="back" size={26} color={lightColors.textSecondary} onPress={handleBack} />
        <View style={styles.searchBarWrapper}>
          <RealSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </View>
      </View>
      <FlatList
        data={filteredEntries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.entryCard}
            onPress={() => router.push(`/journals/${item.id}`)}
          >
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.entryContent} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noEntriesText}>No journal entries found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff', // Set your desired background color here
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Center children vertically
    marginBottom: 8,
  },
  searchBarWrapper: {
    flex: 1, // Take up the remaining space
    marginLeft: 16, // Add space between the back icon and the search bar
  },
  entryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.primary,
  },
  entryContent: {
    fontSize: 14,
    color: '#333',
    marginVertical: 6,
  },
  noEntriesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default SearchJournal;