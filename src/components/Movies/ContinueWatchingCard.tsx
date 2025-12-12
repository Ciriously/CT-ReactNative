import React from 'react';
import {TouchableOpacity, Image, View, StyleSheet, Text} from 'react-native';
import {Play} from 'lucide-react-native';
import CleverTap from 'clevertap-react-native';
import {useNavigation} from '@react-navigation/native';

const ContinueWatchingCard = ({item}: {item: any}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // 1. CLEVERTAP: Detailed "Resumed" Event
    CleverTap.recordEvent('Product Clicked', {
      ...item,
      ClickSource: 'Continue Watching',
      Progress: item.progress, // Specific to this card
      Action: 'Resume',
    });

    // 2. NAVIGATE
    navigation.navigate('MovieDetails', {movie: item});
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={handlePress}>
      <Image
        source={{uri: item.image}}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.playOverlay}>
        <View style={styles.circle}>
          <Play fill="#fff" size={14} color="#fff" style={{marginLeft: 2}} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, {width: `${item.progress}%`}]} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 112,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  image: {width: '100%', height: '100%', opacity: 0.8},
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {height: '100%', backgroundColor: '#E50914'},
  info: {position: 'absolute', bottom: 8, left: 8},
  title: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,1)',
    textShadowRadius: 4,
  },
});

export default ContinueWatchingCard;
