import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

// Create a constant for the localStorage key to avoid typos
const CART_STORAGE_KEY = 'tobe-shop-cart';

// Helper function to load cart items from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return [];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state directly with items from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage());
  const isInitialMount = useRef(true);

  // Save cart to localStorage whenever it changes, but only after initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    try {
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    console.log('Adding item to cart:', item);
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity;
        
        // Don't exceed stock limit
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: Math.min(newQuantity, item.stock)
        };
        
        console.log('Updated cart with existing item:', updatedItems);
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        const newItems = [...prevItems, item];
        console.log('Updated cart with new item:', newItems);
        return newItems;
      }
    });
  };

  const removeFromCart = (id: number) => {
    console.log('Removing item from cart:', id);
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      console.log('Cart after removal:', newItems);
      return newItems;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    console.log('Updating quantity for item:', id, 'to', quantity);
    setCartItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      );
      console.log('Cart after quantity update:', newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return total;
  };

  const getCartCount = () => {
    const count = cartItems.reduce((count, item) => count + item.quantity, 0);
    return count;
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        getCartTotal, 
        getCartCount 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 