import React, {useState, useRef} from 'react';
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
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import CleverTap from 'clevertap-react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

// PRO ASSETS: Icons make forms 2x faster to read
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

// --- HELPER COMPONENT: ANIMATED INPUT ---
// This isolates the logic for the "Glow" effect when you click a box
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
    outputRange: ['#2D2D3A', '#E50914'], // Grey -> Netflix Red on focus
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

// --- MAIN SCREEN ---
const RegisterScreen = () => {
  const navigation = useNavigation<any>();

  // State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    const {name, email, phone, password, confirm} = formData;

    // 1. Validation
    if (!name || !email || !phone || !password) {
      return Toast.show({
        type: 'error',
        text1: 'Missing Details',
        text2: 'Please fill out all fields.',
      });
    }
    if (password !== confirm) {
      return Toast.show({
        type: 'error',
        text1: 'Password Error',
        text2: 'Passwords do not match.',
      });
    }

    setIsLoading(true);

    try {
      // 2. Data Formatting
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // 3. CLEVERTAP INTEGRATION (SECURE)
      // DO NOT send password. Do send "Plan Type" or "Source"
      const userProfile = {
        Name: name,
        Identity: email, // Critical for merging profiles
        Email: email,
        Phone: formattedPhone,
        'Account Created': new Date(),
        'Plan Type': 'Free', // Good for segmentation later
        'MSG-email': true, // Opt-in for email marketing
        'MSG-push': true, // Opt-in for push
      };

      await CleverTap.onUserLogin(userProfile);

      // Track the specific event
      CleverTap.recordEvent('User Registered', {Method: 'Email'});

      // 4. Success UI
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: `Account created for ${name}`,
      });

      // Navigate to Dashboard (passing minimal data)
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 1. CINEMATIC HEADER (Gradient + Back Button) */}
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
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={{opacity: fadeAnim}}>
            <Text style={styles.subHeader}>Start your 30-day free trial.</Text>

            <ModernInput
              label="FULL NAME"
              icon={User}
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(t: string) => setFormData({...formData, name: t})}
            />

            <ModernInput
              label="EMAIL ADDRESS"
              icon={Mail}
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(t: string) => setFormData({...formData, email: t})}
              keyboardType="email-address"
            />

            <ModernInput
              label="PHONE NUMBER"
              icon={Phone}
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChangeText={(t: string) => setFormData({...formData, phone: t})}
              keyboardType="phone-pad"
            />

            <ModernInput
              label="PASSWORD"
              icon={Lock}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChangeText={(t: string) =>
                setFormData({...formData, password: t})
              }
              isSecure={true}
            />

            <ModernInput
              label="CONFIRM PASSWORD"
              icon={Lock}
              placeholder="Re-enter password"
              value={formData.confirm}
              onChangeText={(t: string) =>
                setFormData({...formData, confirm: t})
              }
              isSecure={true}
            />

            {/* MAIN ACTION BUTTON */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Create Account</Text>
                  <ChevronRight color="#fff" size={20} style={{opacity: 0.8}} />
                </>
              )}
            </TouchableOpacity>

            {/* LEGAL FOOTER */}
            <Text style={styles.legalText}>
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure OLED Black
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
    marginBottom: 32,
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
    backgroundColor: '#111', // Slightly lighter than background
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

  // CTA BUTTON
  ctaButton: {
    marginTop: 20,
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
  legalText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#444',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default RegisterScreen;
