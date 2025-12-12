import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CleverTap from 'clevertap-react-native';
import {Bell, Search} from 'lucide-react-native'; // Ensure lucide-react-native is installed

interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({name}) => {
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);

  // Animation for Bell Shake
  const bellAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize Inbox & Listener
    CleverTap.initializeInbox();
    const updateCount = () => {
      CleverTap.getInboxMessageUnreadCount((err, res) => {
        if (!err && res && typeof (res as any).count === 'number') {
          setUnreadCount((res as any).count);
          // Trigger shake animation if new message
          if ((res as any).count > 0) shakeBell();
        }
      });
    };

    updateCount();
    CleverTap.addListener(CleverTap.CleverTapInboxDidInitialize, updateCount);
    CleverTap.addListener(
      CleverTap.CleverTapInboxMessagesDidUpdate,
      updateCount,
    );

    return () => {
      CleverTap.removeListener(CleverTap.CleverTapInboxDidInitialize);
      CleverTap.removeListener(CleverTap.CleverTapInboxMessagesDidUpdate);
    };
  }, []);

  const shakeBell = () => {
    Animated.sequence([
      Animated.timing(bellAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleInbox = () => {
    CleverTap.showInbox({
      tabs: ['Promotions', 'Offers'],
      navBarTitle: 'Notifications',
      navBarColor: '#000000',
      navBarTitleColor: '#FFFFFF',
      inboxBackgroundColor: '#121212',
      backButtonColor: '#E50914',
      unselectedTabColor: '#888888',
      selectedTabColor: '#E50914',
      selectedTabIndicatorColor: '#E50914',
    });
  };

  // Initials for Avatar
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <View style={[styles.container, {paddingTop: insets.top + 10}]}>
      {/* 1. TEXT SECTION */}
      <View style={styles.textColumn}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.username} numberOfLines={1}>
          {name}
        </Text>
      </View>

      {/* 2. ACTION ICONS */}
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton}>
          <Search size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleInbox} style={styles.iconButton}>
          <Animated.View style={{transform: [{translateX: bellAnim}]}}>
            <Bell size={22} color="#fff" />
            {unreadCount > 0 && <View style={styles.dot} />}
          </Animated.View>
        </TouchableOpacity>

        {/* 3. AVATAR */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000000', // Pure Black to match Dashboard
  },
  textColumn: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#888888', // Subtle Grey
    fontFamily: 'System', // Use your Poppins font here if available
    marginBottom: 2,
  },
  username: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', // Glass Effect
    borderRadius: 20,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914', // Netflix Red
    borderWidth: 1,
    borderColor: '#000',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Header;
