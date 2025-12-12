import React, {createContext, useState, useContext, ReactNode} from 'react';

// 1. Define the shape of your Cart Data
type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
};

// 2. Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Create Provider
export const CartProvider = ({children}: {children: ReactNode}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate Total Price
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{cartItems, addToCart, removeFromCart, cartTotal}}>
      {children}
    </CartContext.Provider>
  );
};

// 4. THE FIX: Export the Custom Hook
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
