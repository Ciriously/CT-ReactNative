import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Play} from 'lucide-react-native';
import CleverTap from 'clevertap-react-native';

const {width} = Dimensions.get('window');

const MovieCard = ({item}: {item: any}) => {
  const isWide = item.type === 'featured' || item.type === 'wide';

  return (
    <TouchableOpacity
      style={[styles.card, isWide ? styles.cardWide : styles.cardRegular]}
      activeOpacity={0.9} // High opacity prevents flickering
      onPress={() =>
        CleverTap.recordEvent('Movie Clicked', {Name: item.title})
      }>
      <Image
        source={{uri: item.image}}
        style={styles.image}
        resizeMode="cover"
      />

      {/* VISUAL FIX: Gradient ONLY at the bottom. Top is clear. */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
        locations={[0, 0.7, 1]}
        style={styles.gradient}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
      </LinearGradient>

      {/* Play Icon - Only for wide cards */}
      {isWide && (
        <View style={styles.iconBadge}>
          <Play fill="#fff" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000', // True Black backing
  },
  cardRegular: {
    height: 240,
    width: width / 2 - 8, // Tighter spacing
  },
  cardWide: {
    height: 240,
    width: width - 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Only covers bottom part
    justifyContent: 'flex-end',
    padding: 10,
  },
  title: {
    color: '#FFFFFF', // Pure White
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  category: {
    color: '#E50914', // Netflix Red
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MovieCard;
