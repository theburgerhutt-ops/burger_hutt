'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '@/data/menu';
import { io } from 'socket.io-client';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  originalPrice: number;
  totalPrice: number;
  totalItems: number;
  activeOffer: { title: string; discountPercentage: number; active: boolean; expiryDate?: string } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOffer, setActiveOffer] = useState<{ title: string; discountPercentage: number; active: boolean; expiryDate?: string } | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => setActiveOffer(data))
      .catch(err => console.error("Failed to fetch offer", err));

    // Listen to real-time updates
    const socket = io();
    socket.on('offer-updated', (updatedOffer: any) => {
      setActiveOffer(updatedOffer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const originalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let totalPrice = originalPrice;
  if (activeOffer && activeOffer.active && activeOffer.discountPercentage > 0) {
    let isExpired = false;
    if (activeOffer.expiryDate) {
      const expiry = new Date(activeOffer.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (new Date() > expiry) isExpired = true;
    }
    if (!isExpired) {
      totalPrice = Math.round(originalPrice * (1 - activeOffer.discountPercentage / 100));
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      originalPrice,
      totalPrice, 
      totalItems,
      activeOffer
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
