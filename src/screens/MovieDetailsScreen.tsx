import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useRoute, useNavigation} from '@react-navigation/native';
import CleverTap from 'clevertap-react-native';
import {useCartContext} from '../context/CartContext';
import {
  Play,
  Download,
  Plus,
  ThumbsUp,
  MessageCircle,
  ArrowLeft,
  ShoppingCart,
  Star,
  Eye, // Icon for Live Viewers
} from 'lucide-react-native';

const FAKE_COMMENTS = [
  {
    id: 1,
    user: 'Rahul D.',
    text: 'Absolutely mind-blowing! The VFX are insane.',
    rating: 5,
  },
  {
    id: 2,
    user: 'Sarah K.',
    text: 'Better than the first one. Must watch!',
    rating: 5,
  },
  {
    id: 3,
    user: 'Anon_23',
    text: 'Slow start but the ending saved it.',
    rating: 4,
  },
  {id: 4, user: 'MovieBuff99', text: 'Classic masterpiece.', rating: 5},
];

const MovieDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const {movie} = route.params;
  const {addToCart} = useCartContext();

  // 1. DYNAMIC STATE
  const [price, setPrice] = useState(0);
  const [liveViewers, setLiveViewers] = useState(842); // Start count

  useEffect(() => {
    // A. Generate Random Price between $3.99 and $14.99 on mount
    const randomPrice = (Math.random() * (14.99 - 3.99) + 3.99).toFixed(2);
    setPrice(parseFloat(randomPrice));

    // B. Simulate "Live Viewers" fluctuation
    const interval = setInterval(() => {
      // Randomly add/subtract 1-15 viewers
      const change = Math.floor(Math.random() * 30) - 10;
      setLiveViewers(prev => Math.max(100, prev + change));
    }, 3000);

    // C. Track View
    CleverTap.recordEvent('Product Viewed', {
      ...movie,
      ViewedAt: new Date().toISOString(),
      DynamicPrice: randomPrice, // Track what price was shown
      LiveViewers: liveViewers,
    });

    return () => clearInterval(interval);
  }, [movie]);

  const handleAction = (actionName: string) => {
    CleverTap.recordEvent(`Product Action`, {
      ActionType: actionName,
      MovieTitle: movie.title,
      MovieID: movie.id,
    });
  };

  const handleRent = () => {
    // Pass the random price to cart
    addToCart(movie, price);

    CleverTap.recordEvent('Added to Cart', {
      Product: movie.title,
      Category: movie.category,
      Price: price,
      Currency: 'USD',
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
        {/* HERO IMAGE */}
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

        {/* INFO SECTION */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{movie.title}</Text>

          {/* META ROW */}
          <View style={styles.metaRow}>
            <Text style={styles.matchText}>98% Match</Text>
            <Text style={styles.yearText}>2024</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>12+</Text>
            </View>
            <Text style={styles.durationText}>2h 14m</Text>
          </View>

          {/* 🔥 COOL FEATURE: LIVE VIEWERS PULSE */}
          <View style={styles.liveContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              <Text style={{fontWeight: 'bold', color: '#fff'}}>
                {liveViewers.toLocaleString()}{' '}
              </Text>
              people are watching this right now
            </Text>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handleAction('Play')}>
            <Play fill="#000" size={20} color="#000" />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>

          {/* RENT BUTTON (Dynamic Price) */}
          <TouchableOpacity style={styles.rentButton} onPress={handleRent}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.rentText}>Rent for ${price}</Text>
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

        {/* COMMENTS */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            Fan Reviews ({FAKE_COMMENTS.length})
          </Text>
          {FAKE_COMMENTS.map(comment => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{comment.user[0]}</Text>
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <View style={styles.ratingRow}>
                    <Star fill="#E50914" size={12} color="#E50914" />
                    <Text style={styles.ratingText}>{comment.rating}.0</Text>
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
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
  metaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  matchText: {color: '#46d369', fontWeight: 'bold', marginRight: 12},
  yearText: {color: '#aaa', marginRight: 12},
  ageBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 12,
  },
  ageText: {color: '#fff', fontSize: 12},
  durationText: {color: '#aaa'},

  // LIVE VIEWERS STYLES
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.15)', // Subtle Red BG
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914',
    marginRight: 8,
    shadowColor: '#E50914',
    shadowOpacity: 1,
    shadowRadius: 5, // Glowing Dot
  },
  liveText: {color: '#ccc', fontSize: 12},

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

  rentButton: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    marginBottom: 12,
  },
  rentText: {fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 8},

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

  commentsSection: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  commentCard: {flexDirection: 'row', marginBottom: 16},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {color: '#fff', fontWeight: 'bold'},
  commentContent: {
    flex: 1,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {color: '#fff', fontWeight: 'bold', fontSize: 13},
  ratingRow: {flexDirection: 'row', alignItems: 'center'},
  ratingText: {
    color: '#E50914',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  commentText: {color: '#ccc', fontSize: 13, lineHeight: 18},
});

export default MovieDetailsScreen;
