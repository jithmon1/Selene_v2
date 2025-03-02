import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import DateComponent from './Date'; // Adjust the import path as necessary
import moment from 'moment';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [month, setMonth] = useState<string>(moment().format('MMMM YYYY'));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const startOfMonth = moment().subtract(1, 'month').startOf('month'); // Start from previous month
    const endOfMonth = moment().endOf('month');
    const monthDates = [];

    for (
      let date = startOfMonth;
      date.isBefore(endOfMonth) || date.isSame(endOfMonth, 'day');
      date.add(1, 'days')
    ) {
      monthDates.push(date.clone().toDate());
    }

    setDates(monthDates);
  }, []);

  useEffect(() => {
    const currentDateIndex = dates.findIndex((date) =>
      moment(date).isSame(moment(), 'day')
    );

    if (currentDateIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const itemWidth = screenWidth / 7;
      const scrollToX =
        currentDateIndex * itemWidth - screenWidth / 2 + itemWidth / 2;

      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [dates]);

  useEffect(() => {
    if (selectedDate) {
      setMonth(moment(selectedDate).format('MMMM YYYY'));
    }
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthText}>{month}</Text>
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
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
     alignSelf: 'flex-start', marginLeft: 16 ,
    fontFamily: 'firabold',
    marginBottom: 5,
  },
  scroll: {
    flexDirection: 'row',
  },
});

export default Calendar;
