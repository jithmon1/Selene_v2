import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import quotes from '../constants/quotes';
import lightColors from '../constants/Colors';



const getDailyQuote = (date) => {
  const dayOfYear = moment(date, 'YYYY-MM-DD').dayOfYear();
  return quotes[dayOfYear % quotes.length];
};

const DailyQuote = ({ date }) => {
  const dailyQuote = getDailyQuote(date);

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>{dailyQuote}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  quote: {
    fontSize: 18,
    textAlign: 'center',
    color:lightColors.primary,
    fontFamily: 'firamedium',
  },
});

export default DailyQuote;