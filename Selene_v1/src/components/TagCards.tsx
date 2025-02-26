import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import lightColors from '@/src/constants/Colors';
import { useRouter } from 'expo-router';

interface TagCarouselProps {
  tags: string[];
}

const TagCarousel: React.FC<TagCarouselProps> = ({ tags }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={tags}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.tagCard} onPress={()=>router.push(`/journals/tags/${item}`)}>
            <Text style={styles.tagText}>{item}</Text>
            {/* Bottom Gradient Overlay */}
            
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default TagCarousel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    height: 168,
  },
  tagCard: {
    backgroundColor: lightColors.primary,
    width: 268,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures gradient stays inside the card
    position: 'relative', // Needed for absolute positioning of gradient
  },
  tagText: {
    color: lightColors.accent,
    flex: 1,
    fontSize: 32,
    fontFamily: 'firabold',
    textAlign: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // Adjust height as needed
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
});
