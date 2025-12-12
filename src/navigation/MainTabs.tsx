import React from 'react';
import {View, Text, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, Search, ShoppingBag, User} from 'lucide-react-native';
import {useCartContext} from '../context/CartContext';

// Import Screens
import Dashboard from '../screens/Dashboard';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  // Safe check for cart count
  let cartCount = 0;
  try {
    const {cartItems} = useCartContext();
    cartCount = cartItems.length;
  } catch (e) {}

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: false,

        // 1. SAFE TAB BAR STYLE (No Absolute, No Transparent)
        tabBarStyle: {
          backgroundColor: '#111', // Solid Dark Grey
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingTop: 10,
        },
        // 2. REMOVED 'tabBarBackground' (The likely cause of the grey overlay)

        tabBarIcon: ({focused}) => {
          let IconComponent;
          let color = focused ? '#E50914' : '#888';

          switch (route.name) {
            case 'Dashboard':
              IconComponent = Home;
              break;
            case 'Search':
              IconComponent = Search;
              break;
            case 'Cart':
              IconComponent = ShoppingBag;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return (
            <View style={{alignItems: 'center'}}>
              <IconComponent size={24} color={color} />
              {focused && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#E50914',
                    marginTop: 4,
                  }}
                />
              )}
            </View>
          );
        },
      })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {backgroundColor: '#E50914'},
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
