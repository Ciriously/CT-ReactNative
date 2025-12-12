import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CleverTap from 'clevertap-react-native';
import {Check} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const MoviePoll = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const pollData = {
    question: 'Which sequel are you hyped for?',
    option1: {
      id: 1,
      title: 'Deadpool 3',
      image: 'https://image.tmdb.org/t/p/w500/yF1eOkaYvwiORauRCPWznV9xVvi.jpg',
      genre: 'Action',
    },
    option2: {
      id: 2,
      title: 'Joker 2',
      image: 'https://image.tmdb.org/t/p/w500/aciP8Km0waTLXEYf5ybxb57rJUC.jpg',
      genre: 'Drama',
    },
  };

  const handleVote = (optionId: number, movieTitle: string, genre: string) => {
    if (hasVoted) return;

    setHasVoted(true);
    setSelectedOption(optionId);

    // 1. Track the Vote Event
    CleverTap.recordEvent('Poll Voted', {
      Question: pollData.question,
      SelectedMovie: movieTitle,
      PreferredGenre: genre,
      Date: new Date().toISOString(),
    });

    // 2. THE FIX: Use profileAddMultiValueForKey
    // This safely adds the genre (e.g., 'Action') to the 'Interest_Genres' list on their profile.
    CleverTap.profileAddMultiValueForKey('Interest_Genres', genre);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Fan Battle 🔥</Text>
        <Text style={styles.question}>{pollData.question}</Text>
      </View>

      <View style={styles.pollContainer}>
        <PollOption
          item={pollData.option1}
          isSelected={selectedOption === 1}
          hasVoted={hasVoted}
          onPress={() =>
            handleVote(1, pollData.option1.title, pollData.option1.genre)
          }
          percentage="64%"
        />

        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <PollOption
          item={pollData.option2}
          isSelected={selectedOption === 2}
          hasVoted={hasVoted}
          onPress={() =>
            handleVote(2, pollData.option2.title, pollData.option2.genre)
          }
          percentage="36%"
        />
      </View>
    </View>
  );
};

// Sub-component
const PollOption = ({item, isSelected, hasVoted, onPress, percentage}: any) => {
  return (
    <TouchableOpacity
      style={[styles.optionCard, hasVoted && !isSelected && {opacity: 0.5}]}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={hasVoted}>
      <Image
        source={{uri: item.image}}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />

      {isSelected && (
        <View style={styles.checkBadge}>
          <Check size={14} color="#fff" strokeWidth={4} />
        </View>
      )}

      {hasVoted && (
        <View style={styles.resultOverlay}>
          <Text style={styles.percentageText}>{percentage}</Text>
        </View>
      )}

      <Text style={styles.movieTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {marginVertical: 24, paddingHorizontal: 0},
  headerRow: {marginBottom: 16, paddingHorizontal: 16},
  sectionTitle: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  question: {color: '#fff', fontSize: 18, fontWeight: '700'},
  pollContainer: {
    flexDirection: 'row',
    height: 200,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionCard: {flex: 1, height: '100%', position: 'relative'},
  image: {width: '100%', height: '100%'},
  gradient: {...StyleSheet.absoluteFillObject, top: '50%'},
  movieTitle: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  vsBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  vsText: {color: '#fff', fontWeight: '900', fontSize: 14, fontStyle: 'italic'},
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2ecc71',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(229, 9, 20, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 10,
  },
});

export default MoviePoll;
