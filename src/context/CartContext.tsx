import React, {createContext, useContext, useState} from 'react';
import Toast from 'react-native-toast-message';

// Define the shape of a Cart Item
type MovieItem = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
};

type CartContextType = {
  cartItems: MovieItem[];
  addToCart: (item: any, customPrice?: number) => void; // Updated signature
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}: {children: React.ReactNode}) => {
  const [cartItems, setCartItems] = useState<MovieItem[]>([]);

  // Calculate Total dynamically
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Updated to accept customPrice
  const addToCart = (movie: any, customPrice?: number) => {
    // Prevent duplicates
    if (cartItems.some(item => item.id === movie.id)) {
      Toast.show({
        type: 'info',
        text1: 'Already in Cart',
        text2: `${movie.title} is ready for checkout.`,
      });
      return;
    }

    // Use the passed price OR generate a random one if missing (Fallback)
    const finalPrice =
      customPrice ||
      parseFloat((Math.random() * (12.99 - 3.99) + 3.99).toFixed(2));

    const newItem = {...movie, price: finalPrice};

    setCartItems([...cartItems, newItem]);

    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${movie.title} - $${finalPrice.toFixed(2)}`,
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{cartItems, addToCart, removeFromCart, clearCart, cartTotal}}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error('useCartContext must be used within a CartProvider');
  return context;
};
