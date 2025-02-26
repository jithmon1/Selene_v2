import { View, Platform,StyleSheet, LayoutChangeEvent, Dimensions, } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './TabBarButton';
import { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import COLORS from '../constants/Colors';
function TabBar({ state, descriptors, navigation }:BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const[dimension,setDimensions]=useState({width:20,height:20});
  const buttonWidth=dimension.width/state.routes.length;
  const onTabBarLayout=(e:LayoutChangeEvent)=>{
    setDimensions({
        height:e.nativeEvent.layout.height,
        width:e.nativeEvent.layout.width
    });
  };
  const tabPositionX=useSharedValue(0);
  const animatedStyle=useAnimatedStyle(()=>{
    return{
        transform:[{translateX:tabPositionX.value}]
    }
  })
  return (
    <View onLayout={onTabBarLayout} style={styles.tabBar}>
        <Animated.View style={[animatedStyle,{
            position:'absolute',
            backgroundColor:COLORS.accent,
            borderRadius:30,
            marginHorizontal:12,
            height:dimension.height-15,
            width:buttonWidth-25,
        }]}/>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
            tabPositionX.value=withSpring(buttonWidth*(index),{duration:1500})
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
            <TabBarButton key={route.name} 
            onPress={onPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused?'white':COLORS.accent}
            label={label}
            onLongPress={onLongPress}/>
        
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
    tabBar: {
      position: 'absolute',
      bottom: 16, // Adjusted for a smaller offset from the bottom
      left: 32, // Added horizontal padding
      right: 32,
      flexDirection: 'row',
      justifyContent: 'space-evenly', // Distributes tabs more evenly
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingVertical: 10, // Reduced padding for a slimmer appearance
      borderRadius: 20, // Slightly less rounded corners
      height: 56, // Reduced height for a slimmer tab bar
      
      elevation: 5, // Ensures shadows appear on Android,
      marginHorizontal:32,
    },
    tabBarItem: {
      flex: 1,
      
      justifyContent: 'center',
      alignItems: 'center',
      gap: 3, // Smaller gap between icon and label
      maxWidth: 80, // Reduces the width for a sleeker layout
    },
  });
  
export default TabBar;

