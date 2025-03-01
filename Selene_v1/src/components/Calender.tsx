import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import DateComponent from './Date'; // Adjust the import path as necessary
import moment from 'moment';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [dates, setDates] = useState<Date[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Generate an array of dates for the current month
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const monthDates = [];
    for (let date = startOfMonth; date.isBefore(endOfMonth) || date.isSame(endOfMonth, 'day'); date.add(1, 'days')) {
      monthDates.push(date.clone().toDate());
    }
    setDates(monthDates);
  }, []);

  useEffect(() => {
    // Scroll to the current date
    const currentDateIndex = dates.findIndex(date => moment(date).isSame(moment(), 'day'));
    if (currentDateIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const itemWidth = screenWidth / 7; // Assuming 7 items fit in the screen width
      const scrollToX = (currentDateIndex) * itemWidth - screenWidth / 2 + itemWidth / 2;
      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [dates]);

  return (
    <View style={styles.container}>
      <View style={styles.scroll}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {dates.map((date, index) => (
            <DateComponent
              key={index}
              date={date}
              onSelectDate={onSelectDate}
              selected={selectedDate}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: 16,
  },
  scroll: {
    flexDirection: 'row',
  },
});

export default Calendar;