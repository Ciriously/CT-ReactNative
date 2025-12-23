import 'react-native-reanimated';
import React, {useEffect, useState} from 'react';
import {Platform, View, ActivityIndicator, StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CleverTap from 'clevertap-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {toastConfig} from './components/UI/ CustomToast';

import {CartProvider} from './context/CartContext';
import {useAuthStore} from './store/useAuthStore';
import {AppNavigator} from './navigation/AppNavigator';
import {HomeScreen} from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const MyDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#ffffff',
  },
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: '#000'},
    }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const {isAuthenticated, checkSession} = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. SAFETY: Kill any stuck messages immediately
        CleverTap.discardInAppNotifications();

        await checkSession();

        if (Platform.OS === 'android') {
          CleverTap.createNotificationChannel(
            'CT_PRIMARY',
            'Essential',
            'Updates',
            4,
            true,
          );
        }

        // 2. SAFETY: DO NOT CALL 'promptPushPrimer' HERE YET.
        // That function creates a native UI overlay that can get stuck.
      } catch (error) {
        console.error(error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }
  return (
    <CartProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 1. YOUR APP */}
      <NavigationContainer theme={MyDarkTheme}>
        {isAuthenticated ? <AppNavigator /> : <AuthStack />}
      </NavigationContainer>

      {/* 2. THE COOL TOAST (Must be LAST) */}
      <Toast config={toastConfig} />
    </CartProvider>
  );
};

export default App;
