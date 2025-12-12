import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CleverTap from 'clevertap-react-native';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  isLoading: boolean;
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  // Actions
  checkSession: () => Promise<void>;
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  user: null,
  isAuthenticated: false,

  // 1. CHECK SESSION (Run this when App starts)
  checkSession: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_session');
      if (storedUser) {
        set({ 
          user: JSON.parse(storedUser), 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Note: We DO NOT call CleverTap.onUserLogin here. 
        // The SDK remembers the user automatically.
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (e) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  // 2. LOGIN (Run this on Login/Register button click)
  login: async (name, email) => {
    const userObj = { name, email };
    
    // A. Save to Phone
    await AsyncStorage.setItem('user_session', JSON.stringify(userObj));
    
    // B. Tell CleverTap (Only once!)
    CleverTap.onUserLogin({
      Name: name,
      Identity: email, // This is the unique key
      Email: email,
      'Last Login': new Date(),
    });

    // C. Update App State
    set({ user: userObj, isAuthenticated: true });
  },

  // 3. LOGOUT
  logout: async () => {
    await AsyncStorage.removeItem('user_session');
    CleverTap.recordEvent('User Logout', {});
    set({ user: null, isAuthenticated: false });
  },
}));