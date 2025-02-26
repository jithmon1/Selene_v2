import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import moment from 'moment'
import COLORS from '../constants/Colors'

interface DateProps {
  
  date: Date
  onSelectDate: (date: string) => void
  selected: string
}

const Date: React.FC<DateProps> = ({ date, onSelectDate, selected }) => {
  // if today, show 'Today'
  // if not today, show day of the week e.g 'Mon', 'Tue', 'Wed'
  const day = moment(date).format('ddd')
  // get the day number e.g 1, 2, 3, 4, 5, 6, 7
  const dayNumber = moment(date).format('D')
  const isToday = moment(date).isSame(moment(), 'day');

  // get the full date e.g 2021-01-01 - we'll use this to compare the date to the selected date
  const fullDate = moment(date).format('YYYY-MM-DD')
  return (
    <TouchableOpacity
      onPress={() => onSelectDate(fullDate)}
      style={[styles.card, (selected === fullDate ) && { backgroundColor: COLORS.accent }]}
    >
      <Text
        style={[styles.big, (selected === fullDate ) && { color: "#fff"  }]}
      >
        {dayNumber}
      </Text>
      
      <Text
        style={[styles.medium, (selected === fullDate ) && { color: "#fff"}]}
      >
        {day}
      </Text>
    </TouchableOpacity>
  )
}

export default Date

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#eee',
    borderRadius: 10,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 80,
    width: 72,
    marginHorizontal: 5,
    
  },
  big: {
    fontFamily: 'firamedium',
    fontWeight: 'bold', fontSize: 24
  },
  medium: {
    fontSize: 18,
    fontFamily: 'firamedium',
  },
})