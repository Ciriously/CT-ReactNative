import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// IMPORT SCREENS
import MainTabs from './MainTabs'; // Your Bottom Tab Navigator
import MovieDetailsScreen from '../screens/MovieDetailsScreen'; // The new details page

// Define the parameters for every screen
export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetails: {movie: any}; // Expects a 'movie' object
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      // CRITICAL: Forces background black to prevent "Grey Overlay" during transitions
      contentStyle: {backgroundColor: '#000000'},
      animation: 'fade_from_bottom', // Cinematic transition
    }}>
    {/* The Main App (Tabs) */}
    <Stack.Screen name="MainTabs" component={MainTabs} />

    {/* The Details Page (Pushes on top of tabs) */}
    <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
  </Stack.Navigator>
);
