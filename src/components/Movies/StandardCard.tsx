import React, {useRef} from 'react';
import {
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import CleverTap from 'clevertap-react-native';
import {useNavigation} from '@react-navigation/native';

const StandardCard = ({item}: {item: any}) => {
  const navigation = useNavigation<any>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animation Handlers
  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const handlePress = () => {
    // 1. CLEVERTAP: Send EVERY detail available in the item object
    CleverTap.recordEvent('Product Clicked', {
      ...item, // Spreads: id, title, overview, rating, etc.
      ClickSource: 'Standard Grid',
      Timestamp: new Date().toISOString(),
    });

    // 2. NAVIGATE: Open Product Viewer
    navigation.navigate('MovieDetails', {movie: item});
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}>
      <Animated.View
        style={[styles.container, {transform: [{scale: scaleAnim}]}]}>
        <Image
          source={{uri: item.image}}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 190,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  image: {width: '100%', height: '100%'},
});

export default StandardCard;
