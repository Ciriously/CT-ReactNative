import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
  ActivityIndicator,
  InteractionManager, // <--- Performance Fix
  Platform,
} from 'react-native';
import CleverTap from 'clevertap-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Bell,
  Shield,
  Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// IMPORT STORE
import {useAuthStore} from '../store/useAuthStore';

// --- HELPER COMPONENT: MODERN INPUT ---
const ProfileInput = ({
  label,
  value,
  onChangeText,
  icon: Icon,
  isLocked = false,
  placeholder,
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputContainer, isLocked && styles.lockedInput]}>
      <Icon
        size={18}
        color={isLocked ? '#555' : '#888'}
        style={{marginRight: 12}}
      />
      <TextInput
        style={[styles.input, isLocked && {color: '#666'}]}
        value={value}
        onChangeText={onChangeText}
        editable={!isLocked}
        placeholder={placeholder}
        placeholderTextColor="#444"
      />
      {isLocked && <Shield size={14} color="#333" />}
    </View>
  </View>
);

// --- HELPER COMPONENT: SETTING ROW ---
const SettingRow = ({label, value, onToggle}: any) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingText}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{false: '#333', true: '#E50914'}} // Netflix Red Toggle
      thumbColor={'#fff'}
      ios_backgroundColor="#333"
    />
  </View>
);

const ProfileScreen = () => {
  // 1. GET STORE DATA
  const {user, logout} = useAuthStore();

  // 2. STATE
  const [isReady, setIsReady] = useState(false); // Transition state
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  // Preferences State
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    whatsapp: false,
  });

  // 3. INITIALIZATION (Fixes "Grey" issue & loads data)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      // Load user data into local state
      if (user) {
        setName(user.name || '');
        setPhone(user.phone || '');
        // We don't have DOB/Prefs in the simple AuthStore,
        // so we default them or fetch them if you have an API.
      }
      setIsReady(true); // Unlock UI
    });
    return () => task.cancel();
  }, [user]);

  // 4. HANDLERS
  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          // CleverTap Track Logout
          CleverTap.recordEvent('User Logout', {});
          await logout();
        },
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Construct Profile Update Object
      const profileUpdate = {
        Name: name,
        Phone: phone,
        // Basic DOB parsing (YYYY-MM-DD)
        DOB: dob ? new Date(dob) : null,
        'MSG-email': prefs.email,
        'MSG-push': prefs.push,
        'MSG-whatsapp': prefs.whatsapp,
      };

      // Clean up nulls
      Object.keys(profileUpdate).forEach(
        key =>
          (profileUpdate as any)[key] === null &&
          delete (profileUpdate as any)[key],
      );

      // Send to CleverTap
      await CleverTap.profileSet(profileUpdate);

      Toast.show({type: 'success', text1: 'Profile Updated'});
    } catch (error) {
      console.error(error);
      Toast.show({type: 'error', text1: 'Update Failed'});
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  // 5. RENDER LOADER (Prevents Transition Lag)
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator color="#E50914" />
      </View>
    );
  }

  // 6. MAIN UI
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Cinematic Header Gradient */}
      <LinearGradient
        colors={['rgba(229, 9, 20, 0.15)', 'transparent']}
        style={styles.headerGradient}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* AVATAR HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.welcomeText}>{name || 'Guest User'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* PERSONAL DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

          <ProfileInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            icon={User}
            placeholder="Your Name"
          />

          <ProfileInput
            label="Email Address"
            value={user?.email}
            icon={Mail}
            isLocked={true}
          />

          <ProfileInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            icon={Phone}
            placeholder="+1 234..."
          />

          <ProfileInput
            label="Date of Birth (YYYY-MM-DD)"
            value={dob}
            onChangeText={setDob}
            icon={Calendar}
            placeholder="1995-10-25"
          />
        </View>

        {/* PREFERENCES */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Bell size={16} color="#666" style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          </View>

          <View style={styles.glassPanel}>
            <SettingRow
              label="Email Updates"
              value={prefs.email}
              onToggle={(v: boolean) => setPrefs({...prefs, email: v})}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Push Notifications"
              value={prefs.push}
              onToggle={(v: boolean) => setPrefs({...prefs, push: v})}
            />
            <View style={styles.divider} />
            <SettingRow
              label="WhatsApp Alerts"
              value={prefs.whatsapp}
              onToggle={(v: boolean) => setPrefs({...prefs, whatsapp: v})}
            />
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveText}>Save Changes</Text>
              <Check size={18} color="#fff" style={{marginLeft: 8}} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <LogOut size={18} color="#E50914" style={{marginRight: 8}} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  scrollContent: {padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40},

  // HEADER
  header: {alignItems: 'center', marginBottom: 40},
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    shadowColor: '#E50914',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: {fontSize: 36, fontWeight: 'bold', color: '#E50914'},
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {fontSize: 14, color: '#888'},

  // SECTION
  section: {marginBottom: 32},
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 1,
  },

  // INPUTS
  inputGroup: {marginBottom: 16},
  label: {fontSize: 12, color: '#aaa', marginBottom: 6},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 12,
    height: 54,
  },
  input: {flex: 1, color: '#fff', fontSize: 15, height: '100%'},
  lockedInput: {backgroundColor: '#0a0a0a', borderColor: '#111'},

  // PREFERENCES
  glassPanel: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {color: '#ddd', fontSize: 15},
  divider: {height: 1, backgroundColor: '#222', marginVertical: 8},

  // BUTTONS
  saveButton: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#E50914',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  logoutText: {color: '#E50914', fontSize: 16, fontWeight: '600'},
});

export default ProfileScreen;
