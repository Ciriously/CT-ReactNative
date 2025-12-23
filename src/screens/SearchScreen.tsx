import React, {useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CleverTap from 'clevertap-react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Search, X, PlayCircle, ChevronRight} from 'lucide-react-native';

const API_KEY = '3f3d99a0fd1f7198cfee2091f5b351bf';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query,
        )}&include_adult=false`,
      );
      const json = await response.json();
      const movies = json.results || [];

      setResults(movies);

      // 🔍 TRACK SEARCH EVENT
      CleverTap.recordEvent('Search Performed', {
        Query: query,
        ResultCount: movies.length,
        Date: new Date().toISOString(),
      });

      if (movies.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Results Found',
          text2: `Try searching for something else.`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      Toast.show({
        type: 'error',
        text1: 'Search Failed',
        text2: 'Please check your internet.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const handleMoviePress = (item: any) => {
    // Format data to match Dashboard structure
    const movieData = {
      id: item.id.toString(),
      title: item.title,
      image: item.backdrop_path
        ? `${IMAGE_BASE}${item.backdrop_path}`
        : `${IMAGE_BASE}${item.poster_path}`,
      category: 'Search Result',
      overview: item.overview,
      rating: item.vote_average,
    };

    // 🔍 TRACK CLICK
    CleverTap.recordEvent('Product Clicked', {
      ...movieData,
      ClickSource: 'Search Screen',
      SearchQuery: query,
    });

    // NAVIGATE TO DETAILS
    navigation.navigate('MovieDetails', {movie: movieData});
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleMoviePress(item)}
      style={styles.card}>
      <View style={styles.posterContainer}>
        {item.poster_path ? (
          <Image
            source={{uri: `${IMAGE_BASE}${item.poster_path}`}}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.noPoster]}>
            <Text style={styles.noPosterText}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.year}>
          {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
        </Text>
        <Text style={styles.overview} numberOfLines={2}>
          {item.overview}
        </Text>
      </View>

      <View style={styles.actionIcon}>
        <PlayCircle size={28} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000', '#111']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#888" style={{marginLeft: 12}} />
        <TextInput
          placeholder="Movies, shows, genres..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={styles.input}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={{padding: 8}}>
            <X size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.emptyState}>
            <Search size={64} color="#333" />
            <Text style={styles.emptyText}>Find your next favorite.</Text>
            <Text style={styles.emptySubText}>
              Search for blockbuster movies, TV shows, and more.
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000', paddingTop: 10},
  header: {paddingHorizontal: 16, marginBottom: 12},
  headerTitle: {fontSize: 28, fontWeight: 'bold', color: '#fff'},

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    borderRadius: 8,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {flex: 1, color: '#fff', fontSize: 16, marginLeft: 10, height: '100%'},

  // LIST
  list: {paddingHorizontal: 16, paddingBottom: 40},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  posterContainer: {width: 80, height: 120},
  poster: {width: '100%', height: '100%'},
  noPoster: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {color: '#555', fontSize: 10},

  info: {flex: 1, padding: 12, justifyContent: 'center'},
  title: {fontWeight: 'bold', fontSize: 16, color: '#fff', marginBottom: 4},
  year: {fontSize: 12, color: '#888', marginBottom: 6},
  overview: {fontSize: 12, color: '#aaa', lineHeight: 16},

  actionIcon: {paddingRight: 16},

  // EMPTY STATE
  centerContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
    marginTop: -50,
  },
  emptyText: {color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16},
  emptySubText: {color: '#666', fontSize: 14, marginTop: 8},
});

export default SearchScreen;
