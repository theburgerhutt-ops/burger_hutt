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
  thresholdActive: boolean;
  thresholdMinAmount: number;
  thresholdDiscountPercentage: number;
  thresholdTitle: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dbOffer, setDbOffer] = useState<{ 
    title: string; 
    discountPercentage: number; 
    active: boolean; 
    expiryDate?: string;
    thresholdActive?: boolean;
    thresholdMinAmount?: number;
    thresholdDiscountPercentage?: number;
    thresholdTitle?: string;
  } | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => setDbOffer(data))
      .catch(err => console.error("Failed to fetch offer", err));

    // Listen to real-time updates
    const socket = io();
    socket.on('offer-updated', (updatedOffer: any) => {
      setDbOffer(updatedOffer);
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

  // Compute active offer based on business rules
  let activeOffer: { title: string; discountPercentage: number; active: boolean; expiryDate?: string } | null = null;

  // Verify if global dbOffer is active & not expired
  let isDbOfferValid = false;
  if (dbOffer && dbOffer.active && dbOffer.discountPercentage > 0) {
    let isExpired = false;
    if (dbOffer.expiryDate) {
      const expiry = new Date(dbOffer.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (new Date() > expiry) isExpired = true;
    }
    if (!isExpired) {
      isDbOfferValid = true;
    }
  }

  // Parse dynamic settings from dbOffer (with fallback defaults)
  const tActive = dbOffer?.thresholdActive !== false;
  const tMinAmount = dbOffer?.thresholdMinAmount ?? 400;
  const tDiscountPercentage = dbOffer?.thresholdDiscountPercentage ?? 20;
  const tTitle = dbOffer?.thresholdTitle || "Gourmet Feast Special";

  // Rule: Bill >= dynamic threshold triggers discount
  if (tActive && originalPrice >= tMinAmount) {
    if (!isDbOfferValid || tDiscountPercentage >= dbOffer!.discountPercentage) {
      activeOffer = {
        title: `${tTitle} (${tDiscountPercentage}% Off above ₹${tMinAmount})`,
        discountPercentage: tDiscountPercentage,
        active: true
      };
    } else {
      activeOffer = dbOffer;
    }
  } else if (isDbOfferValid) {
    activeOffer = dbOffer;
  }

  // Calculate final price
  let totalPrice = originalPrice;
  if (activeOffer && activeOffer.active && activeOffer.discountPercentage > 0) {
    totalPrice = Math.round(originalPrice * (1 - activeOffer.discountPercentage / 100));
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
      activeOffer,
      thresholdActive: tActive,
      thresholdMinAmount: tMinAmount,
      thresholdDiscountPercentage: tDiscountPercentage,
      thresholdTitle: tTitle
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
