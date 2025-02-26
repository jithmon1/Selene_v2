import { View, Text, Pressable,StyleSheet} from 'react-native'
import React, { useEffect } from 'react'
import { icon } from '../constants/icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
type TabBarButtonProps = {
    onPress: () => void;
    isFocused: boolean;
    routeName: string;
    color: string;
    label: string;
    onLongPress: () => void;
};

const TabBarButton: React.FC<TabBarButtonProps> = ({ onPress, isFocused, routeName, color, label, onLongPress }) => {
    const scale=useSharedValue(0);
    useEffect(()=>{
        scale.value=withSpring(typeof isFocused==='boolean'?(isFocused?1:0):isFocused),{duration:350};
    },[scale,isFocused]);
    const animatedIconStyle=useAnimatedStyle(()=>{
        const scaleValue=interpolate(scale.value,[0,1],[1,1.05]);
        const top=interpolate(scale.value,[0,1],[0,9]);
        return{
            transform:[{
                scale:scaleValue
            }],top
        }
    })
    const animatedTextStyle=useAnimatedStyle(()=>{
        const opacity=interpolate(scale.value,[0,1],[1,0]);
        return{opacity};
    })
    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabBarItem}>
            <Animated.View style={animatedIconStyle}>
            {icon[routeName] ? icon[routeName]({ color }) : icon.default({ color })}
            </Animated.View>
            
            <Animated.Text style={[{color:isFocused?'#673ab7':'#222',fontSize:12,fontFamily:'firalight'},animatedTextStyle]}>{label}</Animated.Text>
        </Pressable>
    );
};

const styles=StyleSheet.create({
    tabBarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3, // Smaller gap between icon and label
        maxWidth: 80, // Reduces the width for a sleeker layout
      },
      text:{
        fontSize: 18,
        color:'gray',
        
        fontFamily: 'firamedium'
      }
})

export default TabBarButton

