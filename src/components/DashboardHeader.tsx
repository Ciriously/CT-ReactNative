import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Header from './UI/Header';
import BannerCarousel from './UI/BannerCarousel';
import {NativeDisplayCard} from './NativeDisplayCard';
import MoviePoll from './UI/MoviePoll'; // <--- NEW IMPORT

type Props = {
  user: any;
  displayUnit: any;
  isNativeDisplayVisible: boolean;
  onCloseNativeDisplay: () => void;
  // NOTE: Removed onPauseVideo/pauseCount props as Poll handles its own logic
};

const DashboardHeader = ({
  user,
  displayUnit,
  isNativeDisplayVisible,
  onCloseNativeDisplay,
}: Props) => {
  return (
    <View style={styles.container}>
      {/* 1. Greeting */}
      <Header name={user?.name || 'Guest'} />

      {/* 2. CleverTap Native Display */}
      {displayUnit && (
        <NativeDisplayCard
          visible={isNativeDisplayVisible}
          onClose={onCloseNativeDisplay}
          displayUnit={displayUnit}
        />
      )}

      {/* 3. Hero Banners */}
      <BannerCarousel />

      {/* 4. Interactive Poll (Replaces Video Player) */}
      <View style={styles.pollSection}>
        <MoviePoll />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pollSection: {
    marginBottom: 24, // Spacing before the grid starts
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
});

export default DashboardHeader;
