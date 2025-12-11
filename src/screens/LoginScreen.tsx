import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  InteractionManager, // Critical for smooth transitions
} from 'react-native';
import CleverTap from 'clevertap-react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {Mail, Lock, ArrowLeft, LogIn} from 'lucide-react-native';

// --- SHARED COMPONENT: MODERN INPUT ---
// (We reuse this to ensure the app looks consistent)
const ModernInput = ({
  label,
  icon: Icon,
  value,
  onChangeText,
  placeholder,
  isSecure = false,
  keyboardType = 'default',
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedBorder = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedBorder, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedBorder, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2D2D3A', '#E50914'],
  });

  return (
    <View style={{marginBottom: 20}}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Animated.View
        style={[styles.inputContainer, {borderColor: borderColor}]}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={isFocused ? '#E50914' : '#666'} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#555"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
    </View>
  );
};

const LoginScreen = () => {
  const navigation = useNavigation<any>();

  // State (Removed Name - we don't need it for Login)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // FIX: Wait for navigation to finish before showing content
    const task = InteractionManager.runAfterInteractions(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
    return () => task.cancel();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please enter email and password',
      });
    }

    setIsLoading(true);

    try {
      // 1. CLEVERTAP LOGIN
      // We only send Identity (Email). CleverTap merges this with the existing profile.
      // Do NOT send the password.
      const userProfile = {
        Identity: email,
        Email: email,
        'Last Login': new Date(),
      };

      await CleverTap.onUserLogin(userProfile);

      // 2. Track Event
      CleverTap.recordEvent('User Login', {Method: 'Email'});

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Signing you in...',
      });

      // 3. Reset Navigation (Prevents going back to Login)
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 1. CINEMATIC HEADER */}
      <LinearGradient
        colors={['rgba(229, 9, 20, 0.15)', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.safeHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome Back</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={{opacity: fadeAnim}}>
            <Text style={styles.subHeader}>Sign in to continue watching.</Text>

            <ModernInput
              label="EMAIL ADDRESS"
              icon={Mail}
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <ModernInput
              label="PASSWORD"
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isSecure={true}
            />

            {/* FORGOT PASSWORD LINK */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() =>
                Toast.show({type: 'info', text1: 'Reset Link Sent'})
              }>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* MAIN ACTION */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Sign In</Text>
                  <LogIn color="#fff" size={20} style={{opacity: 0.8}} />
                </>
              )}
            </TouchableOpacity>

            {/* REGISTER LINK */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>New to MovieFlix? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign up now.</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // OLED Black
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  safeHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // INPUT STYLES
  inputLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
  },
  iconContainer: {
    width: 50,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  input: {
    flex: 1,
    height: 56,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },

  // LINKS
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },

  // CTA BUTTON
  ctaButton: {
    backgroundColor: '#E50914', // Netflix Red
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // FOOTER
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  registerLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
