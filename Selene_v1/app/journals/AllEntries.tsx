import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import JournalEntriesList from '@/src/components/JournalEntriesList';
import lightColors from '@/src/constants/Colors';

const AllEntries = () => {
  const router = useRouter();
  const { userData, deleteJournal } = useUserData();  // Destructure the data and delete function from context

  // Function to parse the string date into a JavaScript Date object
  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split(' ');

    // Month name to month index mapping
    const monthMap: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthIndex = monthMap[month]; // Get the index of the month
    return new Date(year, monthIndex, parseInt(day)); // Create a Date object
  };

  // Sorting the journals by date
  const sortedEntries = userData
    ? [...userData].sort((a, b) => {
        return parseDate(b.date).getTime() - parseDate(a.date).getTime(); // Sorting by timestamp
      })
    : [];

  return (
    <View style={styles.container}>
      {/* App Bar with Back Arrow */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="All Entries" titleStyle={styles.title} />
      </Appbar.Header>

      {/* Display Sorted Journal Entries */}
      {sortedEntries.length > 0 && (
        <View style={styles.userDataContainer}>
          <JournalEntriesList entries={sortedEntries} />
        </View>
      )}
    </View>
  );
};

export default AllEntries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    color: lightColors.textPrimary,
    fontFamily: 'firabold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'firamedium', // Applying FiraMedium font
    color: lightColors.textPrimary,
  },
  userDataContainer: {
    marginTop: 16,
  },
});
