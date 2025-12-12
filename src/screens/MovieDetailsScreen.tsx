import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useRoute, useNavigation} from '@react-navigation/native';
import CleverTap from 'clevertap-react-native';
import {
  Play,
  Download,
  Plus,
  Star,
  ThumbsUp,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react-native';

const MovieDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const {movie} = route.params;

  useEffect(() => {
    // 🔥 CORE EVENT: Product Viewed
    // Sends the entire movie object as properties
    CleverTap.recordEvent('Product Viewed', {
      ...movie, // Spreads: id, title, image, category, overview, rating
      ViewedAt: new Date().toISOString(),
    });
  }, [movie]);

  const handleAction = (actionName: string) => {
    CleverTap.recordEvent(`Product Action`, {
      ActionType: actionName,
      MovieTitle: movie.title,
      MovieID: movie.id,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={{paddingBottom: 40}}
        showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.heroContainer}>
          <Image
            source={{uri: movie.image}}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', '#000']}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={28} />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.matchText}>98% Match</Text>
            <Text style={styles.yearText}>2024</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>12+</Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handleAction('Play')}>
            <Play fill="#000" size={20} color="#000" />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleAction('Download')}>
            <Download size={20} color="#fff" />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>

          <Text style={styles.synopsis}>
            {movie.overview || 'Experience the cinematic event of the year.'}
          </Text>

          {/* ICONS */}
          <View style={styles.iconRow}>
            <ActionIcon
              icon={Plus}
              label="My List"
              onPress={() => handleAction('Add to List')}
            />
            <ActionIcon
              icon={ThumbsUp}
              label="Rate"
              onPress={() => handleAction('Rate')}
            />
            <ActionIcon
              icon={MessageCircle}
              label="Share"
              onPress={() => handleAction('Share')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const ActionIcon = ({icon: Icon, label, onPress}: any) => (
  <TouchableOpacity style={{alignItems: 'center'}} onPress={onPress}>
    <Icon size={24} color="#fff" />
    <Text style={{color: '#aaa', fontSize: 12, marginTop: 4}}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  heroContainer: {height: 450, position: 'relative'},
  heroImage: {width: '100%', height: '100%'},
  gradient: {position: 'absolute', bottom: 0, left: 0, right: 0, height: 200},
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  infoContainer: {paddingHorizontal: 16, marginTop: -60},
  title: {fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  matchText: {color: '#46d369', fontWeight: 'bold', marginRight: 12},
  yearText: {color: '#aaa', marginRight: 12},
  ageBadge: {backgroundColor: '#333', paddingHorizontal: 6, borderRadius: 4},
  ageText: {color: '#fff', fontSize: 12},
  playButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    marginBottom: 12,
  },
  playText: {fontSize: 16, fontWeight: 'bold', color: '#000', marginLeft: 8},
  downloadButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    marginBottom: 24,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  synopsis: {color: '#fff', lineHeight: 22, fontSize: 14, marginBottom: 24},
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
});

export default MovieDetailsScreen;
