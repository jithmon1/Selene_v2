import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'; // Ensure you have this package installed
import moment from 'moment';

const MonthDropdown: React.FC = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState<string>(moment().format('MMMM')); // Initialize with the current month

  const months = moment.months().map((month) => ({
    label: month,
    value: month,
  }));

 

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
        
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    margin:16,
    width:'30%'
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontFamily:'firaregular'
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily:'firaregular'


  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily:'firaregular'
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily:'firaregular'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily:'firaregular'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default MonthDropdown;