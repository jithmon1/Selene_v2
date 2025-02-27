import { View, TextInput, StyleSheet } from 'react-native';
import React from 'react';
import lightColors from '../constants/Colors';

const RealSearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          autoFocus
          style={styles.searchText}
          placeholder="Search for journal entries"
          autoCapitalize="none"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
};

export default RealSearchBar;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  searchBar: {
    backgroundColor: "rgba(238, 252, 255, 0.8)",
    padding: 8,
    borderRadius: 10,
    flexDirection: 'row',
    borderLeftWidth: 2, // Add left border
    borderRightWidth: 2, // Add right border
    borderColor: lightColors.accent,
    alignItems: 'center',
    gap: 10,
  },
  searchText: {
    color: lightColors.textSecondary,
    flex: 1,
    fontFamily: 'firaregular',
    fontSize: 18,
    marginLeft: 10,
  },
});