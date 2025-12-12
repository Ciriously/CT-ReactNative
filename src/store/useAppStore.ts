import { create } from 'zustand';
import CleverTap from 'clevertap-react-native';

// Define the shape of your Movie/Content
type Movie = {
  id: string;
  title: string;
  poster: string;
  category: 'Action' | 'Drama' | 'Sci-Fi' | 'Anime';
};

type AppState = {
  // 1. DATA STATE
  activeCategory: string;
  myList: Movie[];
  
  // 2. UI ACTIONS
  setActiveCategory: (category: string) => void;
  addToMyList: (movie: Movie) => void;
  removeFromMyList: (movieId: string) => void;
  
  // 3. COMPUTED ACTIONS (CleverTap Integration)
  trackInteraction: (eventName: string, props?: any) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeCategory: 'All',
  myList: [],

  // ACTION: Filter the Bento Grid
  setActiveCategory: (category) => {
    set({ activeCategory: category });
    
    // Automatic Tracking: We know EXACTLY what the user likes now
    CleverTap.recordEvent('Category Filtered', { Category: category });
  },

  // ACTION: Add to "My List" (and sync to CleverTap Profile)
  addToMyList: (movie) => {
    set((state) => {
      // Prevent duplicates
      if (state.myList.find((m) => m.id === movie.id)) return state;
      
      const newList = [...state.myList, movie];

      // SYNC TO CLEVERTAP
      // We push this to the user's profile so we can send Push Notifications 
      // like: "New similar movies to [Title] are out!"
      CleverTap.profileSetMultiValuesForKey('MyWatchlist', movie.title);
      CleverTap.recordEvent('Added to Watchlist', { Title: movie.title, Category: movie.category });

      return { myList: newList };
    });
  },

  removeFromMyList: (movieId) =>
    set((state) => ({
      myList: state.myList.filter((m) => m.id !== movieId),
    })),

  trackInteraction: (eventName, props) => {
    CleverTap.recordEvent(eventName, props);
  },
}));