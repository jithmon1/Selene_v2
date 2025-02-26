import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateComponent from './Date'; // Adjust the import path as necessary
import moment from 'moment';

const CalendarWithDropdown: React.FC = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(moment().format('MMMM')); // Initialize with the current month
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [dates, setDates] = useState<Date[]>([]);

  const months = moment.months().map((month) => ({
    label: month,
    value: month,
  }));

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    // Generate an array of dates for the selected month
    const monthIndex = moment().month(selectedMonth).month();
    const startOfMonth = moment().month(monthIndex).startOf('month');
    const endOfMonth = moment().month(monthIndex).endOf('month');
    const monthDates = [];
    for (let date = startOfMonth; date.isBefore(endOfMonth) || date.isSame(endOfMonth, 'day'); date.add(1, 'days')) {
      monthDates.push(date.clone().toDate());
    }
    setDates(monthDates);
  }, [selectedMonth]);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={months}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select Month' : '...'}
        value={selectedMonth}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setSelectedMonth(item.value);
          setIsFocus(false);
        }}
      />
      <View style={styles.scroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {dates.map((date, index) => (
            <DateComponent
              key={index}
              date={date}
              onSelectDate={handleSelectDate}
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
    width: '30%',
    marginHorizontal: 16,
  },
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  scroll: {
    flexDirection: 'row',
  },
});

export default CalendarWithDropdown;