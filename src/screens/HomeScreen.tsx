import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image, // <--- Using standard Image
  Easing,
  Platform,
  InteractionManager,
} from 'react-native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CleverTap from 'clevertap-react-native';

// Assets
import {ArrowRight, User} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const MOVIE_POSTERS = [
  'https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/original/u3bZgnGQ9T01sWNhyve4z0wHmnH.jpg',
  'https://image.tmdb.org/t/p/original/8RpDcs6KTProjectwrlTIVUpDDb.jpg',
  'https://image.tmdb.org/t/p/original/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // Animation Values
  const contentSlide = useRef(new Animated.Value(60)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const crossFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  // 1. Entrance Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 2. Slideshow Logic
  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(() => {
      const nextIndex = (activeImageIndex + 1) % MOVIE_POSTERS.length;
      setNextImageIndex(nextIndex);

      Animated.timing(crossFadeAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true, // Native driver is safe on View, sometimes buggy on Image props
      }).start(() => {
        if (isFocused) {
          setActiveImageIndex(nextIndex);
          crossFadeAnim.setValue(0);
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [activeImageIndex, isFocused]);

  // 3. Navigation Action
  const handleAction = (screenName: string) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    CleverTap.recordEvent('Onboarding Action', {Type: screenName});

    InteractionManager.runAfterInteractions(() => {
      if (screenName === 'Login') navigation.navigate('Login');
      if (screenName === 'Register') navigation.navigate('Register');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* --- FIX: Use Animated.View wrapping Image to stop React 18 Warning --- */}

      {/* Layer 1: Active Image */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={{uri: MOVIE_POSTERS[activeImageIndex]}}
          style={styles.background}
          resizeMode="cover"
        />
      </View>

      {/* Layer 2: Next Image (Fades In) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {opacity: crossFadeAnim}]}>
        <Image
          source={{uri: MOVIE_POSTERS[nextImageIndex]}}
          style={styles.background}
          resizeMode="cover"
        />
      </Animated.View>

      {/* GRADIENTS */}
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)', '#000000']}
        locations={[0, 0.4, 1]}
        style={styles.bottomGradient}
      />

      {/* CONTENT */}
      <Animated.View
        style={[
          styles.contentContainer,
          {opacity: contentOpacity, transform: [{translateY: contentSlide}]},
        ]}>
        {/* TAG */}
        <View style={styles.glassTag}>
          <View style={styles.redDot} />
          <Text style={styles.tagText}>#1 IN MOVIES TODAY</Text>
        </View>

        {/* TEXT */}
        <Text style={styles.title}>
          Unlimited movies,{'\n'}TV shows, and more.
        </Text>
        <Text style={styles.subtitle}>Watch anywhere. Cancel anytime.</Text>

        {/* PRIMARY BUTTON */}
        <Animated.View
          style={{transform: [{scale: buttonScale}], width: '100%'}}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleAction('Register')}
            activeOpacity={1}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight
              color="#fff"
              size={20}
              strokeWidth={2.5}
              style={{marginLeft: 8}}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* SECONDARY BUTTON */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => handleAction('Login')}
          activeOpacity={0.7}>
          <User color="#ccc" size={18} />
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  background: {width: width, height: height}, // Removed absoluteFill here as parent handles it
  topGradient: {position: 'absolute', top: 0, height: 150, width: '100%'},
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    height: height * 0.7,
    width: '100%',
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },

  glassTag: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E50914',
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },

  primaryButton: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#E50914',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;
