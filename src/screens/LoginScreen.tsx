// ... imports
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CleverTap from 'clevertap-react-native';
import Toast from 'react-native-toast-message'; // <--- IMPORT TOAST
import {useAuthStore} from '../store/useAuthStore';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const {login} = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Missing Email',
        text2: 'Please enter your email to continue.',
      });
      return;
    }

    setLoading(true);
    // Simulate API Call
    setTimeout(async () => {
      const mockUser = {
        name: 'John Doe',
        email: email,
        id: '123456',
        phone: '+1 555 0199',
      };

      // 1. CLEVERTAP LOGIN EVENT
      const profile = {
        Name: mockUser.name,
        Identity: mockUser.email,
        Email: mockUser.email,
        Phone: mockUser.phone,
        'MSG-email': true,
        'MSG-push': true,
        'MSG-whatsapp': true,
      };
      CleverTap.onUserLogin(profile);
      CleverTap.recordEvent('User Login', {Method: 'Email'});

      // 2. STORE SESSION
      await login(mockUser.name, mockUser.email);

      setLoading(false);

      // 3. ✨ WELCOME TOAST
      Toast.show({
        type: 'success',
        text1: 'Welcome Back! 🍿',
        text2: `Logged in as ${email}`,
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Start Watching</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={{marginTop: 20}}>
        <Text style={styles.link}>
          New here?{' '}
          <Text style={{fontWeight: 'bold', color: '#E50914'}}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 24,
  },
  title: {fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 32},
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  link: {color: '#aaa', textAlign: 'center', fontSize: 14},
});

export default LoginScreen;
