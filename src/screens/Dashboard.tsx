import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  InteractionManager,
  Dimensions,
} from 'react-native';
import CleverTap from 'clevertap-react-native';
import LinearGradient from 'react-native-linear-gradient';

// IMPORTS
import {useAuthStore} from '../store/useAuthStore';
import DashboardHeader from '../components/DashboardHeader';
import StandardCard from '../components/Movies/StandardCard';
import ContinueWatchingCard from '../components/Movies/ContinueWatchingCard';

// API CONFIG
const API_KEY = '3f3d99a0fd1f7198cfee2091f5b351bf';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// MOCK DATA: Continue Watching (Simulating User History)
const CONTINUE_WATCHING = [
  {
    id: 'cw1',
    title: 'Stranger Things',
    image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    progress: 45,
    category: 'Sci-Fi',
  },
  {
    id: 'cw2',
    title: 'The Witcher',
    image: 'https://image.tmdb.org/t/p/w500/7vjaCdMW15FEbXyZmmEknZb883t.jpg',
    progress: 80,
    category: 'Fantasy',
  },
  {
    id: 'cw3',
    title: 'Squid Game',
    image: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    progress: 10,
    category: 'Thriller',
  },
];

const Dashboard = () => {
  const {user} = useAuthStore();

  // STATE
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState<any>(null);
  const [isNativeDisplayVisible, setIsNativeDisplayVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // --- 1. INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
      fetchAllCategories();
    });
    return () => task.cancel();
  }, []);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);

      // Fetch 4 different categories in parallel
      const [trendingRes, bollywoodRes, actionRes, animeRes] =
        await Promise.all([
          fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`),
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc`,
          ),
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc`,
          ), // Action
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc`,
          ), // Animation
        ]);

      // Helper to format API results
      const format = (res: any, categoryName: string) =>
        res.results.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          image: `${IMAGE_BASE}${m.poster_path}`,
          category: categoryName,
          overview: m.overview,
          rating: m.vote_average,
        }));

      // Build the Master Section List
      const newSections = [
        // 1. Continue Watching (Custom Row)
        {
          id: 'sec_cw',
          title: 'Continue Watching for ' + (user?.name || 'You'),
          data: CONTINUE_WATCHING,
          type: 'continue_watching',
        },

        // 2. API Rows
        {
          id: 'sec_trend',
          title: 'Trending Now',
          data: format(await trendingRes.json(), 'Trending'),
          type: 'standard',
        },
        {
          id: 'sec_bolly',
          title: 'Bollywood Hits',
          data: format(await bollywoodRes.json(), 'Bollywood'),
          type: 'standard',
        },
        {
          id: 'sec_action',
          title: 'Adrenaline Rush',
          data: format(await actionRes.json(), 'Action'),
          type: 'standard',
        },
        {
          id: 'sec_anime',
          title: 'Animation & Anime',
          data: format(await animeRes.json(), 'Anime'),
          type: 'standard',
        },
      ];

      setSections(newSections);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CLEVERTAP NATIVE DISPLAY LOGIC ---
  useEffect(() => {
    if (!isReady) return;
    if (user) CleverTap.recordEvent('MainScreen Viewed', {Name: user.name});

    const handleDisplayUnitsLoaded = (event: any) => {
      const units = event?.units || [];
      if (units.length > 0) {
        setDisplayUnit(units[0]);
        setIsNativeDisplayVisible(true);
      }
    };

    CleverTap.addListener('onDisplayUnitsLoaded', handleDisplayUnitsLoaded);
    CleverTap.getAllDisplayUnits((units: any) =>
      handleDisplayUnitsLoaded({units}),
    );

    return () => CleverTap.removeListener('onDisplayUnitsLoaded');
  }, [user, isReady]);

  // --- 3. RENDER HELPERS ---
  const renderSection = ({item}: {item: any}) => {
    // Determine which card style to use based on section type
    const isContinueWatching = item.type === 'continue_watching';
    const isTrending = item.title === 'Trending Now';

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <FlatList
          data={item.data}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          keyExtractor={movie => movie.id}
          renderItem={({item: movie, index}) => {
            if (isContinueWatching) {
              return <ContinueWatchingCard item={movie} />;
            }
            return (
              <View>
                <StandardCard item={movie} />
                {/* Netflix Style "Top 10" Numbers */}
                {isTrending && index < 10 && (
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                )}
              </View>
            );
          }}
        />
      </View>
    );
  };

  // --- 4. MAIN RETURN ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#111']}
        style={StyleSheet.absoluteFill}
      />

      {!isReady || loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          // The Main Vertical Scroll
          data={sections}
          keyExtractor={item => item.id}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          // Header Component (Banner, Poll, Native Display)
          ListHeaderComponent={
            <DashboardHeader
              user={user}
              displayUnit={displayUnit}
              isNativeDisplayVisible={isNativeDisplayVisible}
              onCloseNativeDisplay={() => setIsNativeDisplayVisible(false)}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  listContent: {paddingBottom: 100},

  // Section Styles
  sectionContainer: {marginBottom: 32},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  rowContent: {paddingHorizontal: 16},

  // Rank Number for Trending (Outline effect)
  rankNumber: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    fontSize: 85,
    fontWeight: '900',
    color: '#000',
    textShadowColor: '#fff',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 2,
    zIndex: -1,
    // Note: For a true hollow outline, SVG is best, but this shadow trick works for MVPs.
  },
});

export default Dashboard;
