import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import StandardCard from './StandardCard';

interface MovieRowProps {
  title: string;
  movies: any[];
}

const MovieRow = ({title, movies}: MovieRowProps) => {
  if (!movies || movies.length === 0) return null;

  // Check if this is the "Trending" row
  const isTrending = title === 'Trending Now';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <View>
            <StandardCard item={item} />

            {/* ✨ ADD THIS: Big Number Badge for Top 5 Trending */}
            {isTrending && index < 5 && (
              <Text style={styles.rankNumber}>{index + 1}</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: 24},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 12,
  },
  listContent: {paddingHorizontal: 16},

  // RANK NUMBER STYLING
  rankNumber: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    fontSize: 80, // HUGE FONT
    fontWeight: '900',
    color: '#000', // Black Fill
    textShadowColor: '#fff', // White Outline effect
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 1,
    zIndex: -1, // Sits slightly behind the card? Or try zIndex: 10 to sit on top corner
    // For the "Netflix Style", standard approach is SVG, but this text shadow hack works well for MVP.
  },
});

export default MovieRow;
