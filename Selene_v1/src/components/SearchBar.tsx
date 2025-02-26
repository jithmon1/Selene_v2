import { View, Text,StyleSheet, TextInput } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import lightColors from '../constants/Colors'

const SearchBar = () => {
  return (
    <View style={styles.container}>
        <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={24} color='gray' />
            <TextInput style={styles.searchText} placeholder="Search for journal entries"  
            autoCapitalize='none' />
        </View>
    </View>
  )
}

export default SearchBar
const styles=StyleSheet.create({
    container:{
        marginVertical:20,
        
    },
    searchBar:{
        backgroundColor:"rgba(238, 252, 255, 0.8)",
        padding:8,
        borderRadius:10,
        flexDirection:'row',
        borderLeftWidth: 2, // Add left border
    borderRightWidth: 2, // Add right border
    borderColor: lightColors.accent,
        alignItems:'center',
        gap:10,
    },
    searchText:{
        color:lightColors.textSecondary,
        flex:1,
        fontFamily:'firaregular',
        fontSize:18,
        marginLeft:10,
    }

})