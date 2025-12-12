import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CleverTap from 'clevertap-react-native';
import {Play, Info, Plus} from 'lucide-react-native';

const {width} = Dimensions.get('window');

// API CONFIG
const API_KEY = '3f3d99a0fd1f7198cfee2091f5b351bf';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/original'; // Highest Quality for Hero

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const BannerCarousel = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchHeroMovies = async () => {
      try {
        // Fetch "Now Playing" for fresh content
        const response = await fetch(
          `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`,
        );
        const data = await response.json();

        // Take top 5 movies only
        const heroMovies = data.results.slice(0, 5).map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          // Use backdrop_path for wide images, fallback to poster if missing
          image: m.backdrop_path
            ? `${IMAGE_BASE}${m.backdrop_path}`
            : `${IMAGE_BASE}${m.poster_path}`,
          genre:
            m.genre_ids && m.genre_ids.length > 0
              ? GENRE_MAP[m.genre_ids[0]]
              : 'Blockbuster',
          overview: m.overview,
        }));

        setMovies(heroMovies);
        setLoading(false);
      } catch (err) {
        console.error('Banner Fetch Error:', err);
        setLoading(false);
      }
    };

    fetchHeroMovies();
  }, []);

  // 2. AUTO SCROLL LOOP
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= movies.length) nextIndex = 0;

      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    }, 6000); // 6 Seconds per slide

    return () => clearInterval(interval);
  }, [currentIndex, movies.length]);

  const handlePress = (movie: any) => {
    CleverTap.recordEvent('Banner Clicked', {
      Movie: movie.title,
      Genre: movie.genre,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={movies}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={ev => {
          const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        renderItem={({item, index}) => (
          <HeroSlide
            item={item}
            isActive={index === currentIndex}
            onPress={() => handlePress(item)}
          />
        )}
      />

      {/* PAGINATION DOTS */}
      <View style={styles.pagination}>
        {movies.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// --- SUB COMPONENT: THE ANIMATED SLIDE ---
// Extracted to handle its own "Zoom" animation logic
const HeroSlide = ({
  item,
  isActive,
  onPress,
}: {
  item: any;
  isActive: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // RESET
      scaleAnim.setValue(1);
      fadeAnim.setValue(0);

      // START "KEN BURNS" ZOOM & FADE IN TEXT
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.1, // Zoom to 110%
          duration: 6000, // Over 6 seconds
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          delay: 300, // Text appears slightly after image
        }),
      ]).start();
    } else {
      // Reset immediately when inactive
      fadeAnim.setValue(0);
    }
  }, [isActive]);

  return (
    <View style={styles.slideContainer}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{flex: 1}}>
        {/* ANIMATED IMAGE BACKGROUND */}
        <Animated.Image
          source={{uri: item.image}}
          style={[styles.image, {transform: [{scale: scaleAnim}]}]}
          resizeMode="cover"
        />

        {/* GRADIENT OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', '#000000']}
          style={styles.gradient}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            {/* TAGS */}
            <View style={styles.tagRow}>
              <Text style={styles.newTag}>NEW EPISODE</Text>
              <Text style={styles.genre}>{item.genre}</Text>
            </View>

            {/* TITLE */}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            {/* BUTTONS */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.playBtn} onPress={onPress}>
                <Play fill="#000" size={18} color="#000" />
                <Text style={styles.playText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.listBtn}>
                <Plus size={20} color="#fff" />
                <Text style={styles.listText}>My List</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    height: 500, // Cinematic Height
  },
  loadingContainer: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width: width,
    height: 500,
    overflow: 'hidden', // Crucial for Zoom Effect to stay inside bounds
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
    height: 300, // Covers bottom 60%
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // TEXT
  tagRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  newTag: {
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  genre: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },

  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
    letterSpacing: -0.5,
  },

  // BUTTONS
  buttonRow: {flexDirection: 'row', alignItems: 'center'},
  playBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginRight: 16,
  },
  playText: {color: '#000', fontSize: 16, fontWeight: '700', marginLeft: 6},
  listBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', // Glass
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  listText: {color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6},

  // PAGINATION
  pagination: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {height: 6, borderRadius: 3, marginHorizontal: 4},
  dotActive: {width: 24, backgroundColor: '#E50914'},
  dotInactive: {width: 6, backgroundColor: 'rgba(255,255,255,0.4)'},
});

export default BannerCarousel;
