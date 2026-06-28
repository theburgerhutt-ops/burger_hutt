'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  Package, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit2,
  Check, 
  Star, 
  Tag, 
  Image, 
  DollarSign, 
  Bell, 
  X,
  Download,
  Mail,
  Menu
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { menuData } from '@/data/menu';
import { io } from 'socket.io-client';
import styles from './Admin.module.css';

const defaultMockOrders = [
  {
    id: 'mock-1',
    order_id: 'TBH-8429',
    customer_name: 'Rahul Bikaner',
    customer_phone: '6367112075',
    customer_address: 'Table 4 (Dine-in)',
    items: [
      { id: 'm-1', name: 'Vintage Truffle Double', price: 750, quantity: 2 },
      { id: 'm-3', name: 'Hazelnut Frappe', price: 280, quantity: 1 }
    ],
    total_amount: 1780,
    payment_method: 'Cash',
    payment_status: 'paid',
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    screenshot_url: null
  },
  {
    id: 'mock-2',
    order_id: 'TBH-3195',
    customer_name: 'Priya Verma',
    customer_phone: '9876543210',
    customer_address: 'Mukta Prasad Colony, Bikaner',
    items: [
      { id: 'm-2', name: '24K Gold Luxury Burger', price: 1200, quantity: 1 },
      { id: 'm-4', name: 'Classic Cold Coffee', price: 220, quantity: 2 }
    ],
    total_amount: 1640,
    payment_method: 'Online UPI',
    payment_status: 'pending',
    status: 'pending_verification',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    screenshot_url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mock-3',
    order_id: 'TBH-7042',
    customer_name: 'Amit Kumar',
    customer_phone: '9988776655',
    customer_address: 'Takeaway Counter',
    items: [
      { id: 'm-5', name: 'Nature Crafted Shake', price: 320, quantity: 3 }
    ],
    total_amount: 960,
    payment_method: 'Cash',
    payment_status: 'paid',
    status: 'ready',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    screenshot_url: null
  }
];

const defaultMockStaff = [
  { id: 's-1', name: 'Chef Rajesh Kumar', role: 'Head Chef Specialist', contact: '+91 63671 12075', status: 'active' },
  { id: 's-2', name: 'Aman Bikaner', role: 'Rider Courier Specialist', contact: '+91 99887 76655', status: 'active' },
  { id: 's-3', name: 'Priya Sharma', role: 'Cashier Counter Specialist', contact: '+91 98765 43210', status: 'on_break' }
];

const defaultMockGallery = [
  { id: 'g-1', title: 'Signature Double Truffle', category: 'Signature Dishes', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
  { id: 'g-2', title: 'Luxury Gold Leaf Burger', category: 'Signature Dishes', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=600' },
  { id: 'g-3', title: 'Artisan Hazelnut Shake', category: 'Signature Dishes', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600' }
];

const defaultMockReviews = [
  { id: 'r-1', name: 'Rahul Malhotra', rating: 5, text: 'The 24K Gold luxury burger is an absolute masterpiece! Tastes premium and lives up to the name.', approved: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'r-2', name: 'Sneha Verma', rating: 4, text: 'Loved the shakes! Great ambience, clean presentation. Highly recommend.', approved: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'inventory' | 'staff' | 'gallery' | 'offers' | 'reviews' | 'messages' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);
  const [messages, setMessages] = useState<any[]>([]);
  const [toast, setToast] = useState<{ id: string; title: string; body: string; time: string } | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [selectedBillOrder, setSelectedBillOrder] = useState<any | null>(null);

  // Admin authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Check session on mount
    if (sessionStorage.getItem('tbh_admin_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('tbh_admin_password') || 'admin123';
    if (passwordInput === savedPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tbh_admin_authenticated', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tbh_admin_authenticated');
    setPasswordInput('');
  };

  // Stats State
  const [stats, setStats] = useState({
    totalOrders: 3,
    totalRevenue: 2740,
    pendingOrders: 1,
  });

  // Business Control Settings
  const [controls, setControls] = useState({
    isOpen: true,
    allowDelivery: true,
    freeDeliveryLimit: 1200,
    surgePricing: false
  });

  // 1. Orders Data State (initialized clean)
  const [orders, setOrders] = useState<any[]>(defaultMockOrders);

  // 2. Menu Items Data State (initialized clean)
  const [menuItems, setMenuItems] = useState<any[]>(menuData);

  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);

  // New Menu Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'burgers',
    price: '',
    description: '',
    image: '',
    isSpicy: false,
    isVeg: false,
    isBestseller: false
  });

  // 3. Inventory Stock State
  const [inventory, setInventory] = useState<any[]>([
    { id: 'i-1', name: 'Angus Beef Patties', quantity: 82, minRequired: 30, unit: 'pcs' },
    { id: 'i-2', name: '24K Gold Leaves', quantity: 8, minRequired: 15, unit: 'sheets' },
    { id: 'i-3', name: 'Brioche Burger Buns', quantity: 120, minRequired: 40, unit: 'pcs' },
    { id: 'i-4', name: 'Truffle Mayo Spread', quantity: 3.5, minRequired: 5, unit: 'kg' },
    { id: 'i-5', name: 'Aged Cheddar Slices', quantity: 95, minRequired: 35, unit: 'pcs' }
  ]);

  // 3b. Ingredients Stock Purchase Logs States
  const [purchaseLogs, setPurchaseLogs] = useState<any[]>([]);
  const [newPurchase, setNewPurchase] = useState({
    name: '',
    customName: '',
    quantity: '',
    unit: 'pcs',
    totalCost: '',
    date: new Date().toISOString().split('T')[0]
  });


  // 4. Staff List State (initialized clean)
  const [staff, setStaff] = useState<any[]>([]);

  const [newStaff, setNewStaff] = useState({ name: '', role: 'Chef', contact: '' });

  // 5. Gallery Images State (initialized clean)
  const [gallery, setGallery] = useState<any[]>([]);

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');

  // 6. Global Offer State
  const [activeGlobalOffer, setActiveGlobalOffer] = useState({ 
    title: '', 
    discountPercentage: 0, 
    active: false, 
    expiryDate: '',
    thresholdActive: true,
    thresholdTitle: 'Gourmet Feast Special',
    thresholdMinAmount: 400,
    thresholdDiscountPercentage: 20
  });
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState<number | ''>('');
  const [newOfferExpiry, setNewOfferExpiry] = useState('');

  // Threshold offer form input states
  const [thresholdActive, setThresholdActive] = useState(true);
  const [thresholdTitle, setThresholdTitle] = useState('Gourmet Feast Special');
  const [thresholdMinAmount, setThresholdMinAmount] = useState<number | ''>(400);
  const [thresholdDiscountPercentage, setThresholdDiscountPercentage] = useState<number | ''>(20);

  // Sub-tab selection state inside Offers & Promos
  const [offerSubTab, setOfferSubTab] = useState<'global' | 'threshold'>('global');

  // 7. Customer Reviews State (initialized clean)
  const [reviews, setReviews] = useState<any[]>([]);

  // Walk-in Order State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInCustomer, setWalkInCustomer] = useState({
    name: 'Walk-in Guest',
    phone: '',
    address: 'Dine-In',
    paymentMethod: 'Cash',
    paymentStatus: 'paid',
    status: 'preparing'
  });
  const [walkInCart, setWalkInCart] = useState<any[]>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [selectedItemQty, setSelectedItemQty] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleAddWalkInCart = () => {
    if (!selectedMenuItemId) return;
    const item = menuData.find(m => m.id === selectedMenuItemId);
    if (!item) return;

    const existing = walkInCart.find(c => c.id === item.id);
    if (existing) {
      setWalkInCart(walkInCart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + selectedItemQty } : c));
    } else {
      setWalkInCart([...walkInCart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: selectedItemQty
      }]);
    }
    setSelectedItemQty(1);
  };

  const handlePlaceWalkInOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (walkInCart.length === 0) {
      alert('Your walk-in order cart is empty! Please add some menu items first.');
      return;
    }

    const generatedOrderId = `TBH-WI-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = walkInCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderObj = {
      id: `wi-${Date.now()}`,
      order_id: generatedOrderId,
      customer_name: walkInCustomer.name || 'Walk-in Guest',
      customer_phone: walkInCustomer.phone || '0000000000',
      customer_address: walkInCustomer.address || 'Dine-In',
      items: walkInCart,
      total_amount: totalAmount,
      status: walkInCustomer.status,
      created_at: new Date().toISOString(),
      payment_method: walkInCustomer.paymentMethod,
      payment_status: walkInCustomer.paymentStatus,
      screenshot_url: null
    };

    // Optimistically update locally
    const updatedOrders = [orderObj, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('tbh_local_orders', JSON.stringify(updatedOrders));
    recalculateStats(updatedOrders);
    playNotificationSound();

    setWalkInCart([]);
    setWalkInCustomer({
      name: 'Walk-in Guest',
      phone: '',
      address: 'Dine-In',
      paymentMethod: 'Cash',
      paymentStatus: 'paid',
      status: 'preparing'
    });
    setShowWalkInModal(false);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            payment_id: walkInCustomer.paymentMethod === 'Online UPI' ? 'UPI-COUNTER' : 'CASH-COUNTER',
            order_id: generatedOrderId,
            customer_name: walkInCustomer.name || 'Walk-in Guest',
            customer_phone: walkInCustomer.phone || '0000000000',
            customer_address: walkInCustomer.address || 'Dine-In',
            items: walkInCart,
            total_amount: totalAmount,
            status: walkInCustomer.status,
            created_at: new Date().toISOString(),
            payment_method: walkInCustomer.paymentMethod,
            payment_status: walkInCustomer.paymentStatus,
            screenshot_url: null
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const dbOrder = data[0];
        const mapped = {
          id: dbOrder.id,
          order_id: dbOrder.order_id,
          customer_name: dbOrder.customer_name,
          customer_phone: dbOrder.customer_phone,
          customer_address: dbOrder.customer_address,
          items: typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items,
          total_amount: dbOrder.total_amount,
          payment_method: dbOrder.payment_method,
          payment_status: dbOrder.payment_status || 'paid',
          status: dbOrder.status,
          created_at: dbOrder.created_at,
          screenshot_url: dbOrder.screenshot_url
        };
        setOrders(prev => {
          const filtered = prev.map(o => o.id === orderObj.id ? mapped : o);
          localStorage.setItem('tbh_local_orders', JSON.stringify(filtered));
          return filtered;
        });
      }
      alert(`🎉 Walk-in order placed successfully! Order ID: ${generatedOrderId}`);
    } catch (err: any) {
      console.warn('Supabase save failed for walk-in order, saved locally instead:', err);
      alert(`🎉 Walk-in order placed successfully (offline mode)! Order ID: ${generatedOrderId}`);
    }
  };

  // Audio Play Chime Logic
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log('Audio auto-play prevented', error));
      }
    } catch (e) {
      console.log('Audio chime error', e);
    }
  };

  // Load real orders from Supabase on mount & setup real-time listener and polling
  useEffect(() => {
    let knownOrderIds = new Set<string>();

    fetch('/api/offer')
      .then(res => res.json())
      .then(data => {
        setActiveGlobalOffer(data);
        if (data.thresholdActive !== undefined) setThresholdActive(data.thresholdActive);
        if (data.thresholdTitle !== undefined) setThresholdTitle(data.thresholdTitle);
        if (data.thresholdMinAmount !== undefined) setThresholdMinAmount(data.thresholdMinAmount);
        if (data.thresholdDiscountPercentage !== undefined) setThresholdDiscountPercentage(data.thresholdDiscountPercentage);
      })
      .catch(err => console.error("Failed to load offer:", err));

    const fetchOrders = async (isInitial = false) => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        
        if (data) {
          const mappedOrders = data.map((o: any) => ({
            id: o.id,
            order_id: o.order_id,
            customer_name: o.customer_name,
            customer_phone: o.customer_phone,
            customer_address: o.customer_address,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            total_amount: o.total_amount,
            payment_method: o.payment_method,
            payment_status: o.payment_status || (o.status === 'delivered' ? 'paid' : 'pending'),
            status: o.status,
            created_at: o.created_at,
            screenshot_url: o.screenshot_url
          }));

          if (isInitial) {
            knownOrderIds = new Set(mappedOrders.map((o: any) => o.id));
            setOrders(mappedOrders);
            localStorage.setItem('tbh_local_orders', JSON.stringify(mappedOrders));
            recalculateStats(mappedOrders);
          } else {
            const newOrders = mappedOrders.filter((o: any) => !knownOrderIds.has(o.id));
            if (newOrders.length > 0) {
              newOrders.forEach((o: any) => knownOrderIds.add(o.id));
              setToast({
                id: `toast-${Date.now()}`,
                title: '⚡ LIVE ORDER PLACED!',
                body: `${newOrders[0].customer_name} just ordered (Total: ₹${newOrders[0].total_amount})`,
                time: 'Just now'
              });
              playNotificationSound();
            }
            // Always update state in case statuses changed
            setOrders(mappedOrders);
            localStorage.setItem('tbh_local_orders', JSON.stringify(mappedOrders));
            recalculateStats(mappedOrders);
          }
        }
      } catch (err) {
        console.warn('Unable to load orders from API. Falling back to local offline queue.');
        const local = localStorage.getItem('tbh_local_orders');
        if (local) {
          const parsed = JSON.parse(local);
          setOrders(parsed);
          recalculateStats(parsed);
        }
      }
    };

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setReviews(data);
          localStorage.setItem('tbh_reviews', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Unable to load admin reviews from Supabase database. Falling back to local feedback streams.');
        const local = localStorage.getItem('tbh_reviews');
        if (local) {
          setReviews(JSON.parse(local));
        }
      }
    };

    fetchOrders(true);
    fetchReviews();
    fetchMessages();

    // Fallback polling for serverless environments (like Vercel)
    const pollingInterval = setInterval(() => {
      fetchOrders(false);
      fetchReviews();
      fetchMessages();
    }, 10000); // Check for updates every 10 seconds

    // Set up Socket.io client
    const socket = io(); // Connects to current host

    socket.on('new-order', (newOrder: any) => {
      console.log('Socket.io received new order:', newOrder);
      if (knownOrderIds.has(newOrder.id)) return;
      knownOrderIds.add(newOrder.id);
      
      const mappedNew = {
        id: newOrder.id,
        order_id: newOrder.order_id,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        customer_address: newOrder.customer_address,
        items: typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status || 'pending',
        status: newOrder.status,
        created_at: newOrder.created_at,
        screenshot_url: newOrder.screenshot_url
      };
      
      setOrders(prev => {
        const updated = [mappedNew, ...prev];
        localStorage.setItem('tbh_local_orders', JSON.stringify(updated));
        recalculateStats(updated);
        return updated;
      });
      setToast({
        id: `toast-${Date.now()}`,
        title: '⚡ LIVE ORDER PLACED!',
        body: `${mappedNew.customer_name} just ordered (Total: ₹${mappedNew.total_amount})`,
        time: 'Just now'
      });
      playNotificationSound();
    });

    // Load inventory and purchase logs from localStorage
    const savedInventory = localStorage.getItem('tbh_inventory');
    const savedLogs = localStorage.getItem('tbh_purchase_logs');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
    if (savedLogs) {
      setPurchaseLogs(JSON.parse(savedLogs));
    } else {
      const defaultLogs = [
        { id: 'pl-1', name: 'Brioche Burger Buns', date: '2026-05-18', quantity: 50, unit: 'pcs', totalCost: 750 },
        { id: 'pl-2', name: 'Angus Beef Patties', date: '2026-05-19', quantity: 30, unit: 'pcs', totalCost: 2400 },
        { id: 'pl-3', name: 'Aged Cheddar Slices', date: '2026-05-19', quantity: 50, unit: 'pcs', totalCost: 1000 }
      ];
      setPurchaseLogs(defaultLogs);
      localStorage.setItem('tbh_purchase_logs', JSON.stringify(defaultLogs));
    }

    // Load local menu items, staff list, gallery showcase, and customer reviews
    const savedMenu = localStorage.getItem('tbh_menu_items');
    if (savedMenu) {
      setMenuItems(JSON.parse(savedMenu));
    }

    const savedStaff = localStorage.getItem('tbh_staff');
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    } else {
      setStaff(defaultMockStaff);
      localStorage.setItem('tbh_staff', JSON.stringify(defaultMockStaff));
    }

    const savedGallery = localStorage.getItem('tbh_gallery');
    if (savedGallery) {
      setGallery(JSON.parse(savedGallery));
    } else {
      setGallery(defaultMockGallery);
      localStorage.setItem('tbh_gallery', JSON.stringify(defaultMockGallery));
    }

    const savedReviews = localStorage.getItem('tbh_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(defaultMockReviews);
      localStorage.setItem('tbh_reviews', JSON.stringify(defaultMockReviews));
    }


    // Subscribe to new order entries
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        if (knownOrderIds.has(newOrder.id)) return; // prevent duplicate if polling got it first
        knownOrderIds.add(newOrder.id);
        
        const mappedNew = {
          id: newOrder.id,
          order_id: newOrder.order_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address,
          items: typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items,
          total_amount: newOrder.total_amount,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status || 'pending',
          status: newOrder.status,
          created_at: newOrder.created_at,
          screenshot_url: newOrder.screenshot_url
        };
        
        setOrders(prev => {
          const updated = [mappedNew, ...prev];
          recalculateStats(updated);
          return updated;
        });
        setToast({
          id: `toast-${Date.now()}`,
          title: '⚡ LIVE ORDER PLACED!',
          body: `${mappedNew.customer_name} just ordered (Total: ₹${mappedNew.total_amount})`,
          time: 'Just now'
        });
        playNotificationSound();
      })
      .subscribe();

    return () => {
      socket.disconnect();
      subscription.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, []);

  // Update Stats Helper
  const recalculateStats = (currentOrders: any[]) => {
    const total = currentOrders.length;
    const rev = currentOrders
      .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const pend = currentOrders.filter(o => o.status === 'pending' || o.status === 'pending_verification').length;
    setStats({ totalOrders: total, totalRevenue: rev, pendingOrders: pend });
  };

  // 1. Orders Actions
  const handleStatusChange = async (id: string, newStatus: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          status: newStatus,
          payment_status: newStatus === 'delivered' ? 'paid' : o.payment_status
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('tbh_local_orders', JSON.stringify(updated));
    recalculateStats(updated);

    try {
      const updates = { 
        status: newStatus,
        ...(newStatus === 'delivered' ? { payment_status: 'paid' } : {})
      };

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) throw new Error('Failed API request');
    } catch (err) {
      console.warn('Backend update failed, status updated locally in browser storage:', err);
    }
  };

  const handleVerifyPayment = async (id: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return { ...o, payment_status: 'paid', status: 'preparing' };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('tbh_local_orders', JSON.stringify(updated));
    recalculateStats(updated);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', status: 'preparing' })
      });

      if (!res.ok) throw new Error('Failed API request');
      alert('Payment verified manually! Credited to cafe wallet and order status moved to Preparing.');
    } catch (err) {
      console.warn('Backend verification failed, payment verified locally in browser storage:', err);
      alert('Payment verified manually (offline)! Credited locally.');
    }
  };


  // 2. Menu Item Form Submission
  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert('Please fill out the name and price!');
      return;
    }
    const tags: string[] = [];
    if (newItem.isVeg) tags.push('veg');
    if (newItem.isSpicy) tags.push('spicy');
    if (newItem.isBestseller) tags.push('bestseller');

    let updatedMenu = [...menuItems];
    if (editingMenuItemId) {
      updatedMenu = menuItems.map(m => m.id === editingMenuItemId ? {
        ...m,
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
        description: newItem.description,
        image: newItem.image || m.image,
        isVeg: newItem.isVeg,
        tags
      } : m);
      setEditingMenuItemId(null);
    } else {
      const added = {
        id: `m-${Date.now()}`,
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
        rating: 5,
        tags,
        image: newItem.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
        isVeg: newItem.isVeg,
        description: newItem.description || 'Gourmet organic ingredients freshly made to order.'
      };
      updatedMenu = [...menuItems, added];
    }
    setMenuItems(updatedMenu);
    localStorage.setItem('tbh_menu_items', JSON.stringify(updatedMenu));
    setNewItem({ name: '', category: 'burgers', price: '', description: '', image: '', isSpicy: false, isVeg: false, isBestseller: false });
  };

  const handleEditClick = (m: any) => {
    setEditingMenuItemId(m.id);
    setNewItem({
      name: m.name,
      category: m.category,
      price: m.price.toString(),
      description: m.description || '',
      image: m.image || '',
      isSpicy: m.tags?.includes('spicy') || false,
      isVeg: m.isVeg || false,
      isBestseller: m.tags?.includes('bestseller') || false
    });
  };

  const handleCancelEdit = () => {
    setEditingMenuItemId(null);
    setNewItem({ name: '', category: 'burgers', price: '', description: '', image: '', isSpicy: false, isVeg: false, isBestseller: false });
  };

  const exportMenuToCSV = () => {
    const headers = ['Item ID', 'Name', 'Category', 'Price (INR)', 'Vegetarian', 'Spicy', 'Bestseller', 'Description'];
    
    const rows = menuItems.map(m => {
      const isSpicy = m.tags?.includes('spicy') ? 'Yes' : 'No';
      const isBestseller = m.tags?.includes('bestseller') ? 'Yes' : 'No';
      const isVeg = m.isVeg ? 'Yes' : 'No';
      const description = `"${(m.description || '').replace(/"/g, '""')}"`;
      const name = `"${(m.name || '').replace(/"/g, '""')}"`;
      
      return [m.id, name, m.category, m.price, isVeg, isSpicy, isBestseller, description].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BurgerHutt_Menu_Catalog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updatedMenu = menuItems.filter(m => m.id !== id);
    setMenuItems(updatedMenu);
    localStorage.setItem('tbh_menu_items', JSON.stringify(updatedMenu));
  };

  // Helper methods to save to state and localStorage
  const saveInventory = (newInv: any[]) => {
    setInventory(newInv);
    localStorage.setItem('tbh_inventory', JSON.stringify(newInv));
  };

  const saveLogs = (newLogs: any[]) => {
    setPurchaseLogs(newLogs);
    localStorage.setItem('tbh_purchase_logs', JSON.stringify(newLogs));
  };

  // 3. Inventory Action
  const handleRestock = (id: string) => {
    const updated = inventory.map(i => {
      if (i.id === id) {
        const increment = i.unit === 'kg' ? 2 : 20;
        return { ...i, quantity: parseFloat((i.quantity + increment).toFixed(1)) };
      }
      return i;
    });
    saveInventory(updated);

    // Write a restock log automatically to purchase logs for transparency!
    const restockedItem = inventory.find(i => i.id === id);
    if (restockedItem) {
      const increment = restockedItem.unit === 'kg' ? 2 : 20;
      const logEntry = {
        id: `pl-${Date.now()}`,
        name: restockedItem.name,
        date: new Date().toISOString().split('T')[0],
        quantity: increment,
        unit: restockedItem.unit,
        totalCost: 0
      };
      saveLogs([logEntry, ...purchaseLogs]);
    }
  };

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newPurchase.name === 'new' ? newPurchase.customName : newPurchase.name;
    if (!finalName) {
      alert('Please specify the product name!');
      return;
    }
    const qty = parseFloat(newPurchase.quantity);
    const cost = parseFloat(newPurchase.totalCost);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity!');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      alert('Please enter a valid price/cost!');
      return;
    }

    const logEntry = {
      id: `pl-${Date.now()}`,
      name: finalName,
      date: newPurchase.date || new Date().toISOString().split('T')[0],
      quantity: qty,
      unit: newPurchase.unit,
      totalCost: cost
    };

    const updatedLogs = [logEntry, ...purchaseLogs];
    saveLogs(updatedLogs);

    // Update inventory stock
    const existingIndex = inventory.findIndex(i => i.name.toLowerCase() === finalName.toLowerCase());
    let updatedInventory = [...inventory];
    if (existingIndex !== -1) {
      updatedInventory[existingIndex] = {
        ...updatedInventory[existingIndex],
        quantity: parseFloat((updatedInventory[existingIndex].quantity + qty).toFixed(2))
      };
    } else {
      updatedInventory.push({
        id: `i-${Date.now()}`,
        name: finalName,
        quantity: qty,
        minRequired: 10,
        unit: newPurchase.unit
      });
    }
    saveInventory(updatedInventory);

    setNewPurchase({
      name: '',
      customName: '',
      quantity: '',
      unit: 'pcs',
      totalCost: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert(`🎉 Purchase log added! Stock of "${finalName}" increased by ${qty} ${newPurchase.unit}.`);
  };

  const handleDeletePurchaseLog = (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase log? This will also revert the stock level.')) return;
    const logItem = purchaseLogs.find(l => l.id === id);
    if (!logItem) return;

    const updatedLogs = purchaseLogs.filter(l => l.id !== id);
    saveLogs(updatedLogs);

    const existingIndex = inventory.findIndex(i => i.name.toLowerCase() === logItem.name.toLowerCase());
    if (existingIndex !== -1) {
      let updatedInventory = [...inventory];
      const newQty = Math.max(0, parseFloat((updatedInventory[existingIndex].quantity - logItem.quantity).toFixed(2)));
      updatedInventory[existingIndex] = {
        ...updatedInventory[existingIndex],
        quantity: newQty
      };
      saveInventory(updatedInventory);
    }
    alert('Purchase log deleted and stock level reverted!');
  };


  // 4. Staff Actions
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.contact) return;
    const updated = [...staff, {
      id: `s-${Date.now()}`,
      name: newStaff.name,
      role: `${newStaff.role} Specialist`,
      contact: newStaff.contact,
      status: 'active'
    }];
    setStaff(updated);
    localStorage.setItem('tbh_staff', JSON.stringify(updated));
    setNewStaff({ name: '', role: 'Chef', contact: '' });
  };

  const handleFireStaff = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    localStorage.setItem('tbh_staff', JSON.stringify(updated));
  };

  // 5. Gallery Actions
  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl || !newGalleryTitle) return;
    const updated = [...gallery, {
      id: `g-${Date.now()}`,
      title: newGalleryTitle,
      category: 'Signature Dishes',
      url: newGalleryUrl
    }];
    setGallery(updated);
    localStorage.setItem('tbh_gallery', JSON.stringify(updated));
    setNewGalleryUrl('');
    setNewGalleryTitle('');
  };

  // 6. Offers Actions
  const handlePublishOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle || newOfferDiscount === '' || !newOfferExpiry) return;
    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newOfferTitle,
          discountPercentage: Number(newOfferDiscount),
          active: true,
          expiryDate: newOfferExpiry
        })
      });
      const data = await res.json();
      setActiveGlobalOffer(data.offer);
      setNewOfferTitle('');
      setNewOfferDiscount('');
      setNewOfferExpiry('');
      alert('Global Offer Published! Banner activated and prices auto-adjusted.');
    } catch (err) {
      alert('Failed to publish offer');
    }
  };

  const toggleGlobalOffer = async (currentActive: boolean) => {
    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      const data = await res.json();
      setActiveGlobalOffer(data.offer);
    } catch (err) {
      alert('Failed to toggle offer');
    }
  };

  const handleSaveThresholdOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (thresholdMinAmount === '' || thresholdDiscountPercentage === '' || !thresholdTitle) return;
    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholdActive,
          thresholdTitle,
          thresholdMinAmount: Number(thresholdMinAmount),
          thresholdDiscountPercentage: Number(thresholdDiscountPercentage)
        })
      });
      const data = await res.json();
      setActiveGlobalOffer(data.offer);
      alert('Threshold Discount Rule updated and synchronized!');
    } catch (err) {
      alert('Failed to update threshold rule');
    }
  };

  // 7. Reviews Actions
  const toggleReviewApproval = async (id: string, currentApproved: boolean) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: !r.approved } : r);
    setReviews(updated);
    localStorage.setItem('tbh_reviews', JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: !currentApproved })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Backend review approval toggle failed, persisted locally in browser storage:', err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review from feedback stream?')) return;
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    localStorage.setItem('tbh_reviews', JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Review permanently deleted from feedback stream.');
    } catch (err) {
      console.warn('Backend review delete failed, persisted locally in browser storage:', err);
      alert('Review permanently deleted locally.');
    }
  };



  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      localStorage.setItem('tbh_local_messages', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      const local = localStorage.getItem('tbh_local_messages');
      if (local) {
        setMessages(JSON.parse(local));
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;
    
    const updatedMessages = messages.filter(m => m.id !== id);
    setMessages(updatedMessages);
    localStorage.setItem('tbh_local_messages', JSON.stringify(updatedMessages));

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Message deleted successfully.');
      } else {
        console.warn('API delete failed, message deleted locally.');
      }
    } catch (err) {
      console.warn('API delete failed, message deleted locally:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className={styles.adminPage}>
          <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
              <div className={styles.loginHeader}>
                <h2>Burger<span>Hut</span> Console</h2>
                <div className={styles.loginSubtitle}>
                  Authorized Access Only
                </div>
              </div>
              
              <form onSubmit={handleLogin}>
                <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                  <label htmlFor="adminPassword">Console Passcode</label>
                  <input 
                    type="password" 
                    id="adminPassword"
                    placeholder="Enter admin passcode" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    style={{ textAlign: 'center', letterSpacing: '0.1em' }}
                  />
                </div>
                
                {authError && (
                  <div className={styles.errorMessage}>
                    ⚠️ Access Denied: Incorrect passcode.
                  </div>
                )}
                
                <button type="submit" className={styles.submitBtn}>
                  Verify & Enter
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {isMobileMenuOpen && (
        <div 
          className={styles.sidebarBackdrop} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className={styles.adminPage}>
        <div className={styles.dashboardGrid}>
          
          {/* Side Navigation Bar */}
          <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader} style={{ position: 'relative' }}>
              <h2>Burger<span>Hut</span> Admin</h2>
              <button 
                className={styles.closeSidebarBtn}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className={styles.nav}>
              <div 
                className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} /> Dashboard
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart size={18} /> Orders & Tracker
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'menu' ? styles.active : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <Package size={18} /> Menu Items
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'inventory' ? styles.active : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                <TrendingUp size={18} /> Ingredients Stock
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'staff' ? styles.active : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                <Users size={18} /> Staff Directory
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'gallery' ? styles.active : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <Image size={18} /> Cafe Gallery
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'offers' ? styles.active : ''}`}
                onClick={() => setActiveTab('offers')}
              >
                <Tag size={18} /> Offers & Promos
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'reviews' ? styles.active : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={18} /> Cust Reviews
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'messages' ? styles.active : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <Mail size={18} /> Inbox & Messages
              </div>
              <div 
                className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} /> Cafe Settings
              </div>
            </nav>

            <div className={styles.sidebarFooter} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="/" target="_blank" className={styles.viewWebsiteBtn}>
                View Live Site
              </a>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }} 
                className={styles.viewWebsiteBtn}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderColor: 'rgba(239, 68, 68, 0.3)', 
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main Dashboard Panel Body */}
          <main>
            
            {/* Header section area */}
            <div className={styles.headerArea}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                  className={styles.hamburgerBtn}
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open Menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="font-cormorant">
                    Console <span>{activeTab}</span>
                  </h1>
                  <div className={styles.headerSubtitle}>
                    Burger Hut Luxury Management System
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert('Refreshed data channels with postgres database!');
                  playNotificationSound();
                }}
                className={styles.refreshBtn}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Statistics Cards Grid Row */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <h4>Total Revenue</h4>
                <div className={styles.value}>₹{stats.totalRevenue}</div>
              </div>
              <div className={styles.statCard}>
                <h4>Total Orders</h4>
                <div className={styles.value}>{stats.totalOrders}</div>
              </div>
              <div className={`${styles.statCard} ${stats.pendingOrders > 0 ? styles.highlight : ''}`}>
                <h4>Pending Queue</h4>
                <div className={styles.value}>{stats.pendingOrders}</div>
              </div>
            </div>

            {/* Render Tab Views Dynamically */}

            {/* 1. Dashboard Tab View */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className={styles.dashboardControls} style={{ gridTemplateColumns: '1fr' }}>
                  
                  {/* Business Action Controls Card */}
                  <div className={styles.card}>
                    <h3>Store <span>Live controls</span></h3>
                    <div className={styles.controlGrid}>
                      <div className={styles.controlItem}>
                        <div className={styles.controlInfo}>
                          <h5>Cafe Status</h5>
                          <p>{controls.isOpen ? '🟢 Open & Accepting Orders' : '🔴 Closed for Prerendering'}</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={controls.isOpen}
                            onChange={(e) => setControls({ ...controls, isOpen: e.target.checked })}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      <div className={styles.controlItem}>
                        <div className={styles.controlInfo}>
                          <h5>Accept Delivery</h5>
                          <p>Enable rider dispatching</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={controls.allowDelivery}
                            onChange={(e) => setControls({ ...controls, allowDelivery: e.target.checked })}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      <div className={styles.controlItem}>
                        <div className={styles.controlInfo}>
                          <h5>BOGO Promotion</h5>
                          <p>Buy One Get One active</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={controls.surgePricing}
                            onChange={(e) => setControls({ ...controls, surgePricing: e.target.checked })}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      <div className={styles.controlItem}>
                        <div className={styles.controlInfo}>
                          <h5>Free Delivery</h5>
                          <p>For orders ₹{controls.freeDeliveryLimit}+</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={controls.freeDeliveryLimit === 0}
                            onChange={(e) => setControls({ ...controls, freeDeliveryLimit: e.target.checked ? 0 : 1200 })}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Orders live-manager control center */}
                <div className={styles.card}>
                  <h3>Active <span>Incoming Queues & Live Verification</span></h3>
                  <div className={`${styles.tableWrapper} custom-scrollbar`} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer Details</th>
                          <th>Grand Total</th>
                          <th>Payment Method</th>
                          <th>Status Badge</th>
                          <th>Live Action controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5, padding: '30px' }}>
                              🟢 All orders verified! No active pending queues in store.
                            </td>
                          </tr>
                        ) : (
                          orders
                            .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
                            .slice(0, 10) // Show up to 10 active orders requiring kitchen/moderator actions
                            .map((o) => (
                              <tr key={o.id}>
                                <td className="text-gold font-mono font-bold">{o.order_id}</td>
                                <td>
                                  <div className="font-bold text-white">{o.customer_name}</div>
                                  <div className="text-xs text-white/50">{o.customer_phone}</div>
                                </td>
                                <td>
                                  <div className="font-bold">₹{o.total_amount}</div>
                                  <span className={`text-[8px] uppercase font-bold tracking-widest ${o.payment_status === 'paid' ? 'text-[#36B37E]' : 'text-[#FFB800]'}`}>
                                    {o.payment_status === 'paid' ? '✓ Received' : '⌛ Pending'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`${styles.methodBadge} ${o.payment_method?.includes('Online') ? styles.methodOnline : styles.methodCash}`}>
                                    {o.payment_method}
                                  </span>
                                  {o.screenshot_url && (
                                    <button
                                      onClick={() => setSelectedScreenshot(o.screenshot_url)}
                                      style={{
                                        marginTop: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        background: 'rgba(212, 164, 75, 0.1)',
                                        border: '1px solid var(--primary)',
                                        color: 'var(--primary)',
                                        fontSize: '8px',
                                        padding: '3px 6px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                      }}
                                    >
                                      <Image size={9} /> View Proof
                                    </button>
                                  )}
                                </td>
                                <td>
                                  <span className={`${styles.statusBadge} ${
                                    o.status === 'pending' ? styles.statusPending : 
                                    o.status === 'pending_verification' ? styles.statusPending : 
                                    o.status === 'preparing' ? styles.statusPreparing : 
                                    o.status === 'ready' ? styles.statusReady : 
                                    o.status === 'delivered' ? styles.statusDelivered : styles.statusCancelled
                                  }`}>
                                    {o.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td>
                                  <div className="flex gap-2 items-center">
                                    {o.status === 'pending_verification' && (
                                      <button 
                                        onClick={() => handleVerifyPayment(o.id)}
                                        className={styles.actionBtn}
                                        style={{ padding: '6px 10px', fontSize: '9px', whiteSpace: 'nowrap' }}
                                      >
                                        ✓ Verify
                                      </button>
                                    )}
                                    <select 
                                      value={o.status}
                                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                      className={styles.statusSelect}
                                      style={{ padding: '4px 6px', fontSize: '10px' }}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="pending_verification">Verifying</option>
                                      <option value="preparing">Preparing</option>
                                      <option value="ready">Ready</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                      onClick={() => setSelectedBillOrder(o)}
                                      className={styles.actionBtn}
                                      style={{ padding: '4px 6px', fontSize: '10px', background: 'rgba(212,164,75,0.15)', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                    >
                                      🧾 Bill
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Orders & Tracker Tab View */}
            {activeTab === 'orders' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0 }}>Live Customer <span>Orders Stream</span></h3>
                  <button 
                    onClick={() => setShowWalkInModal(true)}
                    className={styles.actionBtn}
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      background: 'var(--primary)',
                      color: 'black',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <Plus size={14} /> Add Walk-in Order
                  </button>
                </div>
                <div className={`${styles.tableWrapper} custom-scrollbar`} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Details</th>
                        <th>Items List</th>
                        <th>Amount Details</th>
                        <th>State Status</th>
                        <th>Action Handles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="font-mono text-gold font-bold">{o.order_id}</td>
                          <td>
                            <div className="font-bold">{o.customer_name}</div>
                            <div className="text-xs opacity-50">{o.customer_phone}</div>
                          </td>
                          <td>
                            <div className="text-xs space-y-1">
                              {o.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-white/80">
                                  {item.quantity}x <span className="text-gold font-semibold">{item.name}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="font-bold text-white">₹{o.total_amount}</div>
                            <span className={`text-[9px] uppercase font-bold tracking-widest ${o.payment_status === 'paid' ? 'text-[#36B37E]' : 'text-[#FFB800]'}`}>
                              {o.payment_status === 'paid' ? '✓ Received' : '⌛ Awaiting payment'}
                            </span>
                            <div>
                              <span className={`${styles.methodBadge} ${o.payment_method?.includes('Online') ? styles.methodOnline : styles.methodCash}`}>
                                {o.payment_method}
                              </span>
                            </div>
                            {o.screenshot_url && (
                              <button
                                onClick={() => setSelectedScreenshot(o.screenshot_url)}
                                style={{
                                  marginTop: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  background: 'rgba(212, 164, 75, 0.1)',
                                  border: '1px solid var(--primary)',
                                  color: 'var(--primary)',
                                  fontSize: '9px',
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                <Image size={10} /> View Proof
                              </button>
                            )}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${
                              o.status === 'pending' ? styles.statusPending : 
                              o.status === 'pending_verification' ? styles.statusPending : 
                              o.status === 'preparing' ? styles.statusPreparing : 
                              o.status === 'ready' ? styles.statusReady : 
                              o.status === 'delivered' ? styles.statusDelivered : styles.statusCancelled
                            }`}>
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2 items-center">
                              {o.status === 'pending_verification' && (
                                <button 
                                  onClick={() => handleVerifyPayment(o.id)}
                                  className={styles.actionBtn}
                                >
                                  Verify Payment
                                </button>
                              )}
                              <select 
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                className={styles.statusSelect}
                              >
                                <option value="pending">Pending</option>
                                <option value="pending_verification">Verifying</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button 
                                onClick={() => setSelectedBillOrder(o)}
                                className={styles.actionBtn}
                                style={{ background: 'rgba(212,164,75,0.15)', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                              >
                                🧾 Bill
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Menu Items Tab View */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-3 gap-6">
                
                {/* Catalog List Table */}
                <div className={`${styles.card} col-span-2`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="!mb-0">Gourmet <span>Menu Catalog</span></h3>
                    <button 
                      onClick={exportMenuToCSV}
                      className="flex items-center gap-1 text-xs font-bold"
                      style={{ background: 'rgba(212, 164, 75, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Download size={14} /> Export to Excel
                    </button>
                  </div>
                  <div className={`${styles.tableWrapper} custom-scrollbar`} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Description</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuItems.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <div className="font-bold text-white">{m.name}</div>
                                <div className="flex gap-1 mt-1">
                                  {m.tags?.map((tag: string) => (
                                    <span key={tag} className="text-[8px] bg-gold/10 text-gold border border-gold/20 px-1.5 py-0.5 rounded font-bold uppercase">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                            </td>
                            <td className="text-xs uppercase text-gold/80 font-bold">{m.category}</td>
                            <td className="font-black text-gold">₹{m.price}</td>
                            <td className="text-xs opacity-60 max-w-[200px] truncate">{m.description}</td>
                            <td>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditClick(m)}
                                  className={styles.editBtn}
                                  style={{ background: 'rgba(212, 164, 75, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMenuItem(m.id)}
                                  className={styles.deleteBtn}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add/Edit Burger Form */}
                <div className={`${styles.card} sticky top-[20px] h-fit`}>
                  <h3>{editingMenuItemId ? 'Edit' : 'Add'} <span>Gourmet Item</span></h3>
                  <form onSubmit={handleMenuSubmit}>
                    <div className={styles.formGroup}>
                      <label>Item Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Vintage Truffle Double" 
                        value={newItem.name || ''}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formRow + " mt-4"}>
                      <div className={styles.formGroup}>
                        <label>Category</label>
                        <select 
                          value={newItem.category || ''}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          <option value="burgers">Burgers</option>
                          <option value="sides">Sides</option>
                          <option value="drinks">Drinks</option>
                          <option value="pizza">Pizza</option>
                          <option value="pasta">Pasta</option>
                          <option value="shakes">Shakes</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Price (INR)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 750" 
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup + " mt-4"}>
                      <label>Image URL / Path</label>
                      <input 
                        type="text" 
                        placeholder="e.g. /menu/burger.png or https://..." 
                        value={newItem.image || ''}
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup + " mt-4"}>
                      <label>Description</label>
                      <textarea 
                        rows={3} 
                        placeholder="Opulent smoke flavor details..." 
                        value={newItem.description || ''}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={newItem.isVeg}
                          onChange={(e) => setNewItem({ ...newItem, isVeg: e.target.checked })}
                        />
                        Vegetarian
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={newItem.isSpicy}
                          onChange={(e) => setNewItem({ ...newItem, isSpicy: e.target.checked })}
                        />
                        Spicy
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={newItem.isBestseller}
                          onChange={(e) => setNewItem({ ...newItem, isBestseller: e.target.checked })}
                        />
                        Best Seller
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button type="submit" className={styles.submitBtn}>
                        {editingMenuItemId ? <Check size={16} /> : <Plus size={16} />} {editingMenuItemId ? 'Save Changes' : 'Add To Catalog'}
                      </button>
                      {editingMenuItemId && (
                        <button type="button" onClick={handleCancelEdit} className={styles.submitBtn} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4. Product Ingredients Tab View */}
            {activeTab === 'inventory' && (
              <div className="space-y-8">
                {/* Log New Stock Purchase Form */}
                <div className={`${styles.card} max-w-3xl mx-auto`}>
                    <h3>Log <span>New Purchase</span></h3>
                    <form onSubmit={handleAddPurchase}>
                      <div className={styles.formGroup}>
                        <label>Ingredient Product</label>
                        <select
                          value={newPurchase.name || ''}
                          onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {inventory.map((i) => (
                            <option key={i.id} value={i.name}>{i.name}</option>
                          ))}
                          <option value="new">➕ Other (Type New Product)</option>
                        </select>
                      </div>

                      {newPurchase.name === 'new' && (
                        <div className={styles.formGroup + " mt-4"}>
                          <label>Custom Product Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Fresh Jalapeños"
                            value={newPurchase.customName || ''}
                            onChange={(e) => setNewPurchase({ ...newPurchase, customName: e.target.value })}
                            required
                          />
                        </div>
                      )}

                      <div className={styles.formGroup + " mt-4"}>
                        <label>Purchase Date</label>
                        <input 
                          type="date"
                          value={newPurchase.date || ''}
                          onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formRow + " mt-4"}>
                        <div className={styles.formGroup}>
                          <label>Quantity</label>
                          <input 
                            type="number"
                            step="any"
                            placeholder="e.g. 50"
                            value={newPurchase.quantity || ''}
                            onChange={(e) => setNewPurchase({ ...newPurchase, quantity: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Unit</label>
                          <select
                            value={newPurchase.unit || ''}
                            onChange={(e) => setNewPurchase({ ...newPurchase, unit: e.target.value })}
                          >
                            <option value="pcs">pcs</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="liters">liters</option>
                            <option value="ml">ml</option>
                            <option value="sheets">sheets</option>
                            <option value="packs">packs</option>
                            <option value="loaves">loaves</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup + " mt-4"}>
                        <label>Total Cost (INR)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 1500"
                          value={newPurchase.totalCost || ''}
                          onChange={(e) => setNewPurchase({ ...newPurchase, totalCost: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className={styles.submitBtn}>
                        <Plus size={16} /> Log Purchase
                      </button>
                    </form>
                  </div>


                {/* Bottom - Purchase History Log Ledger */}
                <div className={styles.card}>
                  <h3>Purchase <span>History Logs & Ledgers</span></h3>
                  <div className={styles.tableWrapper + " mt-4"}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Unit Price</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5, padding: '30px' }}>
                              ⌛ No purchase entries logged yet. Add your first stock purchase above!
                            </td>
                          </tr>
                        ) : (
                          purchaseLogs.map((log) => {
                            const unitPrice = log.quantity > 0 ? (log.totalCost / log.quantity).toFixed(2) : '0.00';
                            return (
                              <tr key={log.id}>
                                <td className="font-mono text-gold/80">{log.date}</td>
                                <td>
                                  <div className="font-bold text-white">{log.name}</div>
                                </td>
                                <td className="font-bold text-white/90">
                                  {log.quantity} <span className="text-xs text-white/50">{log.unit}</span>
                                </td>
                                <td className="font-black text-gold">₹{log.totalCost}</td>
                                <td className="text-xs text-white/60">₹{unitPrice} / {log.unit}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <button 
                                    onClick={() => handleDeletePurchaseLog(log.id)}
                                    className={styles.deleteBtn}
                                    style={{ position: 'relative', top: 'auto', right: 'auto', display: 'inline-flex' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {/* 5. Staff Directory Tab View */}
            {activeTab === 'staff' && (
              <div className="grid grid-cols-3 gap-6">
                
                {/* Roster display */}
                <div className={`${styles.card} col-span-2`}>
                  <h3>Active <span>Personnel Roster</span></h3>
                  <div className={styles.staffGrid + " mt-4"}>
                    {staff.map((s) => (
                      <div key={s.id} className={styles.staffCard}>
                        <div className={styles.staffAvatar}>
                          {s.name.replace('Chef ', '').slice(0, 2).toUpperCase()}
                        </div>
                        <h4>{s.name}</h4>
                        <div className={styles.staffRole}>{s.role}</div>
                        <div className={styles.staffInfo}>
                          ☎ {s.contact}
                        </div>

                        <span className={`${styles.staffStatusBadge} ${
                          s.status === 'active' ? styles.staffActive : 
                          s.status === 'on_break' ? styles.staffOnBreak : styles.staffOffline
                        }`}>
                          {s.status.replace('_', ' ')}
                        </span>

                        <button 
                          onClick={() => handleFireStaff(s.id)}
                          className={styles.deleteBtn}
                          style={{ top: '20px', left: '20px', right: 'auto' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hire Staff Form */}
                <div className={styles.card}>
                  <h3>Hire <span>New Team Member</span></h3>
                  <form onSubmit={handleAddStaff}>
                    <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Varun Dhawan" 
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup + " mt-4"}>
                      <label>Team Role</label>
                      <select 
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="Chef">Gourmet Chef</option>
                        <option value="Pastry Cook">Pastry Baker</option>
                        <option value="Delivery Rider">Rider Courier</option>
                        <option value="Cashier Counter">Cashier Operator</option>
                      </select>
                    </div>

                    <div className={styles.formGroup + " mt-4"}>
                      <label>Contact Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +91 99999 00000" 
                        value={newStaff.contact}
                        onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      <Plus size={16} /> Hire Professional
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 6. Gallery Management Tab View */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-3 gap-6">
                
                {/* Images grid */}
                <div className={`${styles.card} col-span-2`}>
                  <h3>Homepage <span>Media Showcase</span></h3>
                  <div className={styles.galleryGrid + " mt-4"}>
                    {gallery.map((g) => (
                      <div key={g.id} className={styles.galleryCard}>
                        <img src={g.url} alt={g.title} className={styles.galleryImage} />
                        <div className={styles.galleryInfo}>
                          <h4>{g.title}</h4>
                          <span className={styles.galleryTag}>{g.category}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const updated = gallery.filter(item => item.id !== g.id);
                            setGallery(updated);
                            localStorage.setItem('tbh_gallery', JSON.stringify(updated));
                          }}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload mock form */}
                <div className={styles.card}>
                  <h3>Upload <span>Gourmet Media</span></h3>
                  <form onSubmit={handleAddGallery}>
                    <div className={styles.formGroup}>
                      <label>Media Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Firehouse Grill Kitchen" 
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup + " mt-4"}>
                      <label>Upload Image (Direct File)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewGalleryUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setNewGalleryUrl('');
                          }
                        }}
                        required
                        className="file-input-custom"
                        style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }}
                      />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      <Plus size={16} /> Add Image To Site
                    </button>
                  </form>
                </div>
              </div>
            )}

                {activeTab === 'offers' && (
              <div>
                {/* Luxury inner sub-tabs navigation */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '25px',
                  paddingBottom: '0px'
                }}>
                  <button
                    type="button"
                    onClick={() => setOfferSubTab('global')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: offerSubTab === 'global' ? '2px solid var(--primary)' : '2px solid transparent',
                      color: offerSubTab === 'global' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      fontFamily: 'var(--font-poppins)'
                    }}
                  >
                    Global Sitewide Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferSubTab('threshold')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: offerSubTab === 'threshold' ? '2px solid var(--primary)' : '2px solid transparent',
                      color: offerSubTab === 'threshold' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      fontFamily: 'var(--font-poppins)'
                    }}
                  >
                    Order Value Discount Rule
                  </button>
                </div>

                {offerSubTab === 'global' && (
                  <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    <div className={styles.card}>
                      <h3>Global <span>Active Offer</span></h3>
                      <div className="mt-4">
                        {activeGlobalOffer.active ? (
                          <div style={{ padding: '25px', background: 'rgba(212, 164, 75, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', textAlign: 'center' }}>
                            <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '1.2rem', fontFamily: 'var(--font-cormorant)' }}>{activeGlobalOffer.title}</h4>
                            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '10px' }}>{activeGlobalOffer.discountPercentage}% OFF</p>
                            {activeGlobalOffer.expiryDate && (
                              <p style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '20px' }}>
                                Expires on: {new Date(activeGlobalOffer.expiryDate).toLocaleDateString('en-IN')}
                              </p>
                            )}
                            <button onClick={() => toggleGlobalOffer(activeGlobalOffer.active)} style={{ background: 'transparent', border: '1px solid #FF3B30', color: '#FF3B30', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                              Deactivate Global Offer
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: '30px', opacity: 0.6, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                            <p>No active global offer right now.</p>
                            {activeGlobalOffer.title && (
                               <button onClick={() => toggleGlobalOffer(activeGlobalOffer.active)} style={{ marginTop: '20px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                 Reactivate Previous: {activeGlobalOffer.title}
                               </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Create Promo Code form */}
                    <div className={styles.card}>
                      <h3>Create & Publish <span>Global Offer</span></h3>
                      <form onSubmit={handlePublishOffer}>
                        <div className={styles.formGroup}>
                          <label>Offer Title / Banner Text</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Weekend Flash Sale!" 
                            value={newOfferTitle}
                            onChange={(e) => setNewOfferTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.formGroup + " mt-4"}>
                          <label>Discount Percentage (%)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 20" 
                            min="1" max="100"
                            value={newOfferDiscount}
                            onChange={(e) => setNewOfferDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                          />
                        </div>

                        <div className={styles.formGroup + " mt-4"}>
                          <label>Offer Expiry Date</label>
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={newOfferExpiry}
                            onChange={(e) => setNewOfferExpiry(e.target.value)}
                            required
                          />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                          <Plus size={16} /> Deploy & Publish Global Offer
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {offerSubTab === 'threshold' && (
                  <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {/* Dynamic Threshold Offer Rule form */}
                    <div className={styles.card}>
                      <h3>Threshold <span>Discount Rule</span></h3>
                      <form onSubmit={handleSaveThresholdOffer}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          <label className={styles.switch}>
                            <input 
                              type="checkbox" 
                              checked={thresholdActive}
                              onChange={(e) => setThresholdActive(e.target.checked)}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>
                            {thresholdActive ? '✓ Rule Enabled' : '⌛ Rule Disabled'}
                          </span>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Offer Rule Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Gourmet Feast Special" 
                            value={thresholdTitle}
                            onChange={(e) => setThresholdTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                          <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Min Bill Amount (₹)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 400" 
                              min="0"
                              value={thresholdMinAmount}
                              onChange={(e) => setThresholdMinAmount(e.target.value === '' ? '' : Number(e.target.value))}
                              required
                            />
                          </div>

                          <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Discount (%)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 20" 
                              min="1" max="100"
                              value={thresholdDiscountPercentage}
                              onChange={(e) => setThresholdDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} style={{ marginTop: '20px' }}>
                          <Plus size={16} /> Save & Apply Discount Rule
                        </button>
                      </form>
                    </div>

                    {/* Offer Logic Help / Guide */}
                    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3>Discount <span>Rule Explanation</span></h3>
                      <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 164, 75, 0.1)', borderRadius: '12px', marginTop: '15px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                          This rule allows you to reward customers who place large orders. When enabled:
                        </p>
                        <ul style={{ color: 'white', fontSize: '0.85rem', lineHeight: '1.8', margin: '10px 0 0 0', paddingLeft: '20px' }}>
                          <li>If the customer's cart subtotal reaches <strong style={{ color: 'var(--primary)' }}>₹{thresholdMinAmount || '0'}</strong> or more, they automatically receive a <strong style={{ color: 'var(--primary)' }}>{thresholdDiscountPercentage || '0'}% discount</strong>.</li>
                          <li>For smaller carts, a dynamic progress banner prompts the user with the exact amount needed to unlock the discount.</li>
                          <li>If a global offer (like a Weekend Flash Sale) is active and has a higher discount rate, the system will apply the higher rate to protect the customer.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. Customer Reviews Moderation Tab View */}
            {activeTab === 'reviews' && (
              <div className={styles.card}>
                <h3>Client <span>Feedback Moderation</span></h3>
                <div className={styles.tableWrapper + " mt-4"}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Rating Stars</th>
                        <th>Review Text Content</th>
                        <th>Attached Media</th>
                        <th>Show on Homepage?</th>
                        <th>Discard Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5, padding: '30px' }}>
                            ⌛ No customer reviews found in database.
                          </td>
                        </tr>
                      ) : (
                        reviews.map((r) => (
                          <tr key={r.id}>
                            <td className="font-bold text-white">{r.name}</td>
                            <td>
                              <div className={styles.ratingWrapper}>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={i < Math.floor(r.rating) ? styles.starGold : styles.starGray} 
                                  />
                                ))}
                              </div>
                            </td>
                            <td className={styles.reviewText} style={{ maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              "{r.text}"
                            </td>
                            <td>
                              {r.media_url ? (
                                r.media_type === 'video' ? (
                                  <video 
                                    src={r.media_url} 
                                    controls 
                                    style={{
                                      width: '110px',
                                      height: '65px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(212, 164, 75, 0.25)',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  <img 
                                    src={r.media_url} 
                                    alt="Review attached media" 
                                    style={{
                                      width: '110px',
                                      height: '65px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(212, 164, 75, 0.25)',
                                      objectFit: 'cover',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(r.media_url, '_blank')}
                                  />
                                )
                              ) : (
                                <span style={{ fontSize: '9px', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Media</span>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <label className={styles.switch}>
                                  <input 
                                    type="checkbox" 
                                    checked={r.approved}
                                    onChange={() => toggleReviewApproval(r.id, r.approved)}
                                  />
                                  <span className={styles.slider}></span>
                                </label>
                                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                                  {r.approved ? '✓ Published' : '⌛ Disabled'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleDeleteReview(r.id)}
                                className={styles.deleteBtn}
                                style={{ position: 'relative', top: 'auto', right: 'auto', display: 'inline-flex' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8b. Messages Tab View */}
            {activeTab === 'messages' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>Customer <span>Inquiries & Messages</span></h3>
                  <button 
                    onClick={fetchMessages}
                    className="btn-primary"
                    style={{ animation: 'none', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', letterSpacing: '0.1em' }}
                  >
                    <RefreshCw size={14} /> REFRESH
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {messages.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No customer messages received yet.</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <div 
                        key={msg.id} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 5px 0', fontFamily: 'var(--font-cormorant)' }}>
                              {msg.subject || 'No Subject'}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                              From: <span style={{ color: '#fff' }}>{msg.name}</span> &lt;{msg.email}&gt;
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ 
                          color: '#fff', 
                          opacity: 0.9, 
                          fontSize: '0.9rem', 
                          margin: 0, 
                          lineHeight: 1.6, 
                          background: 'rgba(0,0,0,0.3)', 
                          padding: '15px', 
                          borderLeft: '3px solid var(--primary)',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={styles.deleteBtn}
                            style={{ position: 'relative', top: 'auto', right: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 12px', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} /> DELETE MESSAGE
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 9. Settings Tab View */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div className={styles.card}>
                  <h3>Cafe Parameter <span>Configuration</span></h3>
                  <div className="space-y-4">
                    <div className={styles.formGroup}>
                      <label>Cafe Branding Title</label>
                      <input type="text" defaultValue="The Burger Hut Vintage Gourmet" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Customer Support Helpline</label>
                      <input type="tel" defaultValue="+91 1800 240 5000" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Store Location Address</label>
                      <input type="text" defaultValue="Sector 15, Vintage Luxury Road, Gurgaon" />
                    </div>
                    <button 
                      onClick={() => alert('Branding settings saved successfully!')} 
                      className={styles.submitBtn}
                    >
                      Save Configurations
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>Delivery & <span>Financial Rules</span></h3>
                  <div className="space-y-4">
                    <div className={styles.formGroup}>
                      <label>Standard Delivery Fee (INR)</label>
                      <input type="number" defaultValue="150" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Minimum Cart value for Checkout</label>
                      <input type="number" defaultValue="450" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Razorpay Merchant Account API Mode</label>
                      <select defaultValue="test">
                        <option value="test">Razorpay Test Gateway Sandbox</option>
                        <option value="live">Razorpay Live Production Gateway</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => alert('Delivery and payment configurations synchronized!')} 
                      className={styles.submitBtn}
                    >
                      Save Financial Parameters
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>Security & <span>Passcode</span></h3>
                  <div className="space-y-4">
                    <div className={styles.formGroup}>
                      <label>Update Admin Passcode</label>
                      <input 
                        type="password" 
                        id="newAdminPasswordInput" 
                        placeholder="Enter new passcode"
                        style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const inputEl = document.getElementById('newAdminPasswordInput') as HTMLInputElement;
                        if (inputEl && inputEl.value.trim()) {
                          localStorage.setItem('tbh_admin_password', inputEl.value.trim());
                          alert('🔑 Passcode updated successfully! Use your new passcode for next logins.');
                          inputEl.value = '';
                        } else {
                          alert('Please enter a valid passcode!');
                        }
                      }} 
                      className={styles.submitBtn}
                    >
                      Update Passcode
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Real-time Order Popup Alert Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className={styles.toastNotification}
          >
            <div className={styles.toastHeader}>
              <div className={styles.toastAlertTitle}>
                <span></span>
                {toast.title}
              </div>
              <div 
                className={styles.toastCloseBtn}
                onClick={() => setToast(null)}
              >
                <X size={14} />
              </div>
            </div>
            
            <div className={styles.toastBody}>
              <div className={styles.toastIconWrapper}>
                <Bell size={20} className="text-gold" />
              </div>
              <div className={styles.toastContent}>
                <h4>Gourmet Order Incoming!</h4>
                <p>{toast.body}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deluxe Screenshot Verification Modal */}
      {selectedScreenshot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#120d0b',
            border: '1px solid #D4A44B',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            borderRadius: '0px'
          }}>
            <button 
              onClick={() => setSelectedScreenshot(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.7
              }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ 
              fontFamily: 'var(--font-cormorant)', 
              fontSize: '1.8rem', 
              color: '#D4A44B', 
              marginBottom: '20px', 
              textAlign: 'center',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Payment Proof Receipt
            </h3>
            
            <div style={{
              width: '100%',
              height: '350px',
              border: '1px solid rgba(212, 164, 75, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '25px',
              background: 'rgba(0, 0, 0, 0.4)'
            }}>
              <img 
                src={selectedScreenshot} 
                alt="Payment proof screenshot" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => {
                  const orderToVerify = orders.find(o => o.screenshot_url === selectedScreenshot);
                  if (orderToVerify) {
                    handleVerifyPayment(orderToVerify.id);
                  }
                  setSelectedScreenshot(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#D4A44B',
                  color: 'black',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Approve Payment & Confirm Order
              </button>
              <button 
                onClick={() => setSelectedScreenshot(null)}
                style={{
                  padding: '12px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  background: 'transparent',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Walk-in Order Modal */}
      {showWalkInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(18, 13, 11, 0.95)',
            border: '1px solid var(--primary)',
            borderRadius: '28px',
            padding: '35px',
            width: '100%',
            maxWidth: '900px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            position: 'relative'
          }}>
            {/* Vintage corners decoration */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
            <div style={{ position: 'absolute', top: '15px', right: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />
            <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(212, 164, 75, 0.15)', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-cormorant)', fontSize: '2rem', color: 'white' }}>
                Add <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Walk-in Order</span>
              </h3>
              <button 
                onClick={() => {
                  setShowWalkInModal(false);
                  setWalkInCart([]);
                }}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.walkInGrid}>
              
              {/* Left Column: Customer & Payment Details */}
              <div className="space-y-4">
                <h4 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  Customer Details
                </h4>

                <div className={styles.formGroup}>
                  <label>Guest Name</label>
                  <input 
                    type="text"
                    value={walkInCustomer.name || ''}
                    onChange={(e) => setWalkInCustomer({ ...walkInCustomer, name: e.target.value })}
                    placeholder="e.g. Walk-in Guest"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                  <label>Phone Number (Optional)</label>
                  <input 
                    type="tel"
                    value={walkInCustomer.phone || ''}
                    onChange={(e) => setWalkInCustomer({ ...walkInCustomer, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                  />
                </div>

                <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                  <label>Table / Destination Details</label>
                  <input 
                    type="text"
                    value={walkInCustomer.address || ''}
                    onChange={(e) => setWalkInCustomer({ ...walkInCustomer, address: e.target.value })}
                    placeholder="e.g. Dine-In Table 3 or Takeaway"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                    required
                  />
                </div>

                <h4 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginTop: '20px' }}>
                  Billing & Status
                </h4>

                <div className={styles.walkInDouble}>
                  <div className={styles.formGroup}>
                    <label>Payment Method</label>
                    <select
                      value={walkInCustomer.paymentMethod || ''}
                      onChange={(e) => setWalkInCustomer({ ...walkInCustomer, paymentMethod: e.target.value })}
                      style={{ background: '#1C1512', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                    >
                      <option value="Cash">💵 Cash Counter</option>
                      <option value="Online UPI">📱 Online UPI</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Payment Status</label>
                    <select
                      value={walkInCustomer.paymentStatus || ''}
                      onChange={(e) => setWalkInCustomer({ ...walkInCustomer, paymentStatus: e.target.value })}
                      style={{ background: '#1C1512', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                    >
                      <option value="paid">✓ Paid</option>
                      <option value="pending">⌛ Pending</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                  <label>Initial Kitchen Status</label>
                  <select
                    value={walkInCustomer.status || ''}
                    onChange={(e) => setWalkInCustomer({ ...walkInCustomer, status: e.target.value })}
                    style={{ background: '#1C1512', border: '1px solid rgba(212, 164, 75, 0.2)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                  >
                    <option value="preparing">🍳 Preparing (Default)</option>
                    <option value="pending">⌛ Pending Kitchen Queue</option>
                    <option value="ready">🔔 Ready for Service</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Menu Cart Builder */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h4 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '15px' }}>
                  Build Orders Basket
                </h4>

                {/* Add Item form strip */}
                <div style={{ background: 'rgba(212, 164, 75, 0.05)', border: '1px solid rgba(212, 164, 75, 0.15)', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                  <div className={styles.walkInItemStrip}>
                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Category</label>
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedMenuItemId('');
                        }}
                        style={{ background: '#1C1512', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', width: '100%', fontSize: '12px' }}
                      >
                        <option value="All">All Categories</option>
                        {Array.from(new Set(menuData.map(m => m.category))).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Select Dish</label>
                      <select 
                        value={selectedMenuItemId}
                        onChange={(e) => setSelectedMenuItemId(e.target.value)}
                        style={{ background: '#1C1512', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', width: '100%', fontSize: '12px' }}
                      >
                        <option value="">-- Choose Item --</option>
                        {menuData
                          .filter(m => selectedCategory === 'All' || m.category === selectedCategory)
                          .map(m => (
                            <option key={m.id} value={m.id}>{m.name} - ₹{m.price}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ width: '80px' }}>
                      <label style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '3px' }}>Qty</label>
                      <input 
                        type="number"
                        min="1"
                        max="20"
                        value={selectedItemQty}
                        onChange={(e) => setSelectedItemQty(parseInt(e.target.value) || 1)}
                        style={{ background: '#1C1512', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', width: '100%', textAlign: 'center', fontSize: '12px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddWalkInCart}
                      disabled={!selectedMenuItemId}
                      style={{
                        flex: 1,
                        background: selectedMenuItemId ? 'rgba(212, 164, 75, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: selectedMenuItemId ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        marginTop: '12px'
                      }}
                    >
                      + Add To Basket
                    </button>
                  </div>
                </div>

                {/* Cart Items list */}
                <div style={{ 
                  flex: 1, 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  padding: '15px', 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  marginBottom: '20px'
                }}>
                  {walkInCart.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '12px', paddingTop: '40px' }}>
                      🛒 Orders Basket is currently empty.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {walkInCart.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', marginTop: '6px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--primary)' }}>
                              ₹{item.price} x {item.quantity}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                            <button
                              type="button"
                              onClick={() => setWalkInCart(walkInCart.filter(c => c.id !== item.id))}
                              style={{ background: 'transparent', border: 'none', color: '#FF3B30', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Basket summary and action */}
                <div style={{ borderTop: '1px solid rgba(212, 164, 75, 0.15)', paddingTop: '15px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>GRAND TOTAL:</span>
                    <span style={{ fontSize: '24px', fontFamily: 'var(--font-cormorant)', color: 'var(--primary)', fontWeight: 900 }}>
                      ₹{walkInCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      type="button"
                      onClick={handlePlaceWalkInOrder}
                      disabled={walkInCart.length === 0}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: walkInCart.length > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: 'black',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.85rem',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: walkInCart.length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ⚡ Save Walk-in Order
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowWalkInModal(false);
                        setWalkInCart([]);
                      }}
                      style={{
                        padding: '12px 20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        background: 'transparent',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Dynamic Digital & Print Invoice Bill Modal */}
      {selectedBillOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* Custom POS printer CSS rules embedded dynamically */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #receipt-print-area, #receipt-print-area * {
                visibility: visible !important;
              }
              #receipt-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 76mm !important; /* Standard thermal receipt width */
                padding: 4mm !important;
                background: white !important;
                color: black !important;
                font-family: 'Courier New', Courier, monospace !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                box-shadow: none !important;
                border: none !important;
              }
              #receipt-print-area button, #receipt-print-area .no-print {
                display: none !important;
              }
            }
          `}} />

          <div style={{
            background: 'rgba(18, 13, 11, 0.98)',
            border: '1px solid var(--primary)',
            borderRadius: '24px',
            padding: '30px',
            width: '100%',
            maxWidth: '550px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedBillOrder(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ 
              fontFamily: 'var(--font-cormorant)', 
              fontSize: '1.8rem', 
              color: 'var(--primary)', 
              marginBottom: '20px', 
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              Gourmet Invoice & Receipt
            </h3>

            {/* Bill Receipt Render Wrapper */}
            <div 
              id="receipt-print-area" 
              style={{
                background: '#fff',
                color: '#000',
                padding: '24px',
                borderRadius: '16px',
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '13px',
                lineHeight: '1.4',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.15)',
                marginBottom: '25px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>BURGER HUT</h2>
                <p style={{ margin: '0', fontSize: '11px', opacity: 0.8 }}>Premium AI-Powered Cafe</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '10px', opacity: 0.8 }}>Mukta Prasad, Bikaner, Rajasthan</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', opacity: 0.8 }}>☎ +91 63671 12075</p>
                <div style={{ borderBottom: '1px dashed #000', margin: '12px 0' }} />
              </div>

              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div><strong>Order ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedBillOrder.order_id}</span></div>
                <div><strong>Date:</strong> {new Date(selectedBillOrder.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                <div><strong>Customer:</strong> {selectedBillOrder.customer_name}</div>
                <div><strong>Phone:</strong> {selectedBillOrder.customer_phone}</div>
                <div><strong>Address/Table:</strong> {selectedBillOrder.customer_address}</div>
                <div><strong>Payment:</strong> {selectedBillOrder.payment_method} ({selectedBillOrder.payment_status?.toUpperCase()})</div>
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

              {/* Items details table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #000' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '5px' }}>ITEM</th>
                    <th style={{ textAlign: 'center', paddingBottom: '5px' }}>QTY</th>
                    <th style={{ textAlign: 'right', paddingBottom: '5px' }}>PRICE</th>
                    <th style={{ textAlign: 'right', paddingBottom: '5px' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBillOrder.items && selectedBillOrder.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ paddingTop: '6px', paddingBottom: '6px', textAlign: 'left', fontWeight: 'bold' }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedBillOrder.total_amount - Math.round(selectedBillOrder.total_amount * 0.05)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST (2.5%):</span>
                  <span>₹{Math.round(selectedBillOrder.total_amount * 0.025)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST (2.5%):</span>
                  <span>₹{Math.round(selectedBillOrder.total_amount * 0.025)}</span>
                </div>
                <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>GRAND TOTAL:</span>
                  <span>₹{selectedBillOrder.total_amount}</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '12px 0' }} />

              <div style={{ textAlign: 'center', fontSize: '10px', fontStyle: 'italic' }}>
                <p style={{ margin: '0 0 4px 0' }}>Thank you for visiting Burger Hut!</p>
                <p style={{ margin: '0' }}>Have a gourmet luxury day! 🍔❤️</p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--primary)',
                    color: 'black',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontSize: '0.8rem',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🖨️ Print Bill (Thermal / PDF)
                </button>

                <button
                  onClick={() => {
                    const customer_phone = selectedBillOrder.customer_phone.replace(/\s+/g, '').replace(/^\+/, '');
                    const formattedPhone = customer_phone.length === 10 ? `91${customer_phone}` : customer_phone;
                    
                    const itemsText = selectedBillOrder.items
                      ? selectedBillOrder.items.map((item: any) => `- *${item.name}* (${item.quantity}x) - ₹${item.price * item.quantity}`).join('%0A')
                      : '';
                    
                    const waText = `🍔 *BURGER HUT RECEIPT* 🍔%0A-------------------------%0A*Order ID:* ${selectedBillOrder.order_id}%0A*Date:* ${new Date(selectedBillOrder.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}%0A*Customer:* ${selectedBillOrder.customer_name}%0A%0A*Items List:*%0A${itemsText}%0A-------------------------%0A*Grand Total:* ₹${selectedBillOrder.total_amount}%0A%0A*Thank you for dining at Burger Hut!* 🍟❤️%0A📍 Mukta Prasad, Bikaner, Rajasthan%0A☎️ +91 63671 12075`;
                    
                    const waUrl = `https://wa.me/${formattedPhone}?text=${waText}`;
                    window.open(waUrl, '_blank');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#25D366',
                    color: 'white',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontSize: '0.8rem',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  💬 Send to WhatsApp
                </button>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    const itemsText = selectedBillOrder.items
                      ? selectedBillOrder.items.map((item: any) => `- ${item.name} (${item.quantity}x) - ₹${item.price * item.quantity}`).join('\n')
                      : '';
                    const smsText = `🍔 BURGER HUT RECEIPT 🍔\n-------------------------\nOrder ID: ${selectedBillOrder.order_id}\nCustomer: ${selectedBillOrder.customer_name}\n\nItems:\n${itemsText}\n-------------------------\nGrand Total: ₹${selectedBillOrder.total_amount}\n\nThank you! Visit again. 📍 Bikaner Rajasthan`;
                    
                    navigator.clipboard.writeText(smsText);
                    alert('📋 Bill details copied to clipboard successfully! You can now paste and send it via SMS, Email, or iMessage.');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy Bill Text (SMS/Share)
                </button>

                <button
                  onClick={() => setSelectedBillOrder(null)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#999',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
