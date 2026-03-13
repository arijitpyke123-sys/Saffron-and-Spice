import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Phone, Instagram, Facebook, Twitter, Menu, X, ChevronRight, ShoppingCart, Plus, Minus, Trash2, ClipboardList, ChefHat, Bike, Store, PackageCheck, Search, Star, User, LogOut, Heart, TrendingUp, Sun, Moon, Flame, UtensilsCrossed } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const REVIEWS: any[] = [];
const MENU_ITEMS: any[] = [];

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  isVeg: boolean;
};

type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
  type: 'delivery' | 'pickup';
};

const INITIAL_TABLES = [
  // Window Seats (Right side)
  { id: 'W1', type: '2-seater', status: 'available', label: 'W1', x: 85, y: 20 },
  { id: 'W2', type: '2-seater', status: 'available', label: 'W2', x: 85, y: 40 },
  { id: 'W3', type: '2-seater', status: 'booked', label: 'W3', x: 85, y: 60 },
  { id: 'W4', type: '2-seater', status: 'available', label: 'W4', x: 85, y: 80 },

  // Private Booths (Top)
  { id: 'B1', type: '4-seater', status: 'available', label: 'B1', x: 30, y: 15 },
  { id: 'B2', type: '4-seater', status: 'booked', label: 'B2', x: 50, y: 15 },
  { id: 'B3', type: '4-seater', status: 'available', label: 'B3', x: 70, y: 15 },

  // Main Dining (Center)
  { id: 'M1', type: '4-seater', status: 'available', label: 'M1', x: 40, y: 40 },
  { id: 'M2', type: '4-seater', status: 'available', label: 'M2', x: 60, y: 40 },
  { id: 'M3', type: '6-seater', status: 'available', label: 'M3', x: 50, y: 60 },
  { id: 'M4', type: '4-seater', status: 'booked', label: 'M4', x: 40, y: 80 },
  { id: 'M5', type: '4-seater', status: 'available', label: 'M5', x: 60, y: 80 },

  // Bar Area (Left)
  { id: 'Bar1', type: '1-seater', status: 'available', label: '1', x: 15, y: 30 },
  { id: 'Bar2', type: '1-seater', status: 'available', label: '2', x: 15, y: 45 },
  { id: 'Bar3', type: '1-seater', status: 'booked', label: '3', x: 15, y: 60 },
  { id: 'Bar4', type: '1-seater', status: 'available', label: '4', x: 15, y: 75 },
];

function DraggableMenuItem({ dish, index, favorites, toggleFavorite, expandedItems, toggleExpand, addToCart, rating }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dish.id,
    data: dish,
  });

  return (
    <motion.div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`node-card group flex flex-col overflow-hidden ${isDragging ? 'opacity-50 ring-2 ring-[var(--color-n8n-coral)] z-50' : ''}`}
    >
      <div className="h-48 overflow-hidden relative border-b border-[var(--color-n8n-border)]">
        <div className="absolute top-3 left-3 z-10 bg-[var(--color-n8n-surface)]/80 backdrop-blur-md border border-[var(--color-n8n-border)] px-2 py-1 rounded text-xs font-mono text-[var(--color-n8n-text-muted)] flex items-center shadow-sm">
          <span className={`w-2 h-2 rounded-full mr-2 ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {dish.isVeg ? 'Veg' : 'Non-Veg'}
        </div>
        {rating && (
          <div className="absolute bottom-3 left-3 z-10 bg-[var(--color-n8n-surface)]/80 backdrop-blur-md border border-[var(--color-n8n-border)] px-2 py-1 rounded text-[10px] font-mono text-[var(--color-n8n-coral)] flex items-center shadow-sm">
            <Star size={10} className="mr-1 fill-current" />
            {rating.toFixed(1)}
          </div>
        )}
        <img 
          src={dish.img} 
          alt={dish.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-n8n-surface)] to-transparent opacity-60" />
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(dish.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-[var(--color-n8n-surface)]/80 backdrop-blur-md border border-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-coral)] hover:border-[var(--color-n8n-coral)] transition-colors shadow-sm"
        >
          <Heart size={16} className={favorites.includes(dish.id) ? "fill-current text-[var(--color-n8n-coral)]" : ""} />
        </button>
      </div>
      <div className="p-5 flex-1 flex flex-col relative">
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-n8n-surface)] border-2 border-[var(--color-n8n-border)] group-hover:border-[var(--color-n8n-coral)] transition-colors"></div>
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-n8n-surface)] border-2 border-[var(--color-n8n-border)] group-hover:border-[var(--color-n8n-coral)] transition-colors"></div>
        
        <div className="flex justify-between items-start mb-3 gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-sans font-bold mb-1 text-[var(--color-n8n-text)] leading-tight group-hover:text-[var(--color-n8n-coral)] transition-colors">{dish.name}</h3>
            <div className="text-xs font-mono text-[var(--color-n8n-text-muted)]">ID: {dish.id.padStart(4, '0')}</div>
          </div>
          <span className="text-[var(--color-n8n-text)] font-mono font-bold text-lg shrink-0 bg-[var(--color-n8n-darker)] px-2 py-1 rounded border border-[var(--color-n8n-border)]">${dish.price}</span>
        </div>
        <div className="flex-1 mb-5">
          <p className={`text-[var(--color-n8n-text-muted)] font-light leading-relaxed text-sm ${expandedItems.includes(dish.id) ? '' : 'line-clamp-2'}`}>
            {dish.desc}
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleExpand(dish.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[var(--color-n8n-coral)] text-xs mt-2 hover:underline focus:outline-none font-mono"
          >
            {expandedItems.includes(dish.id) ? 'Show less' : 'Show more'}
          </button>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); addToCart(dish); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] py-2.5 rounded-lg hover:bg-[var(--color-n8n-coral)] hover:border-[var(--color-n8n-coral)] transition-all flex items-center justify-center font-mono font-medium text-xs uppercase tracking-wider group/btn"
        >
          <Plus size={14} className="mr-2 group-hover/btn:rotate-90 transition-transform" /> Add to Order
        </button>
      </div>
    </motion.div>
  );
}

function DroppableCartArea({ children, isOrderPlaced, isCheckout }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'cart-droppable',
    disabled: isOrderPlaced || isCheckout,
  });

  return (
    <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-6 transition-colors ${isOver ? 'bg-[var(--color-n8n-coral)]/5' : ''}`}>
      {children}
    </div>
  );
}

function DroppableCartIcon({ cartCount, onClick, className, iconSize = 20 }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'cart-icon-droppable',
  });

  return (
    <button 
      ref={setNodeRef}
      onClick={onClick}
      className={`relative transition-colors ${className} ${isOver ? 'text-[var(--color-n8n-coral)] scale-110' : ''}`}
    >
      <ShoppingCart size={iconSize} />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-[var(--color-n8n-coral)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {cartCount}
        </span>
      )}
    </button>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'ready_for_pickup' | 'picked_up' | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', dish: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const dishRatings = useMemo(() => {
    const ratings: Record<string, { total: number, count: number }> = {};
    
    reviews.forEach(review => {
      if (review.dish) {
        if (!ratings[review.dish]) {
          ratings[review.dish] = { total: 0, count: 0 };
        }
        ratings[review.dish].total += review.rating;
        ratings[review.dish].count += 1;
      }
    });
    
    const averages: Record<string, number> = {};
    Object.keys(ratings).forEach(dishName => {
      averages[dishName] = ratings[dishName].total / ratings[dishName].count;
    });
    
    return averages;
  }, [reviews]);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const formattedReviews = data.map((record: any) => ({
              id: record.id,
              name: record.name || 'Anonymous',
              rating: record.rating || 5,
              comment: record.comment || '',
              dish: record.dish || '',
              avatar: record.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name || 'A')}&background=random`
            }));
            setReviews(formattedReviews);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });
      
      if (response.ok) {
        const record = await response.json();
        const formattedReview = {
          id: record.id,
          name: record.name || 'Anonymous',
          rating: record.rating || 5,
          comment: record.comment || '',
          dish: record.dish || '',
          avatar: record.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name || 'A')}&background=random`
        };
        setReviews(prev => [formattedReview, ...prev]);
        setIsReviewModalOpen(false);
        setNewReview({ name: '', rating: 5, comment: '', dish: '' });
      } else {
        alert('Failed to submit review.');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const toggleFavorite = (dishId: string) => {
    setFavorites(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await fetch(`/api/orders/${currentUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            setOrderHistory(data);
          }
        } catch (error) {
          console.error('Failed to fetch order history:', error);
        }
      } else {
        setOrderHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && orderHistory.length > 0) {
      localStorage.setItem(`orders_${user.uid}`, JSON.stringify(orderHistory));
    }
  }, [orderHistory, user]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      setAuthError('Firebase is not initialized. Please check your configuration in src/firebase.ts.');
      return;
    }
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
      setIsLoginOpen(false);
    } catch (error: any) {
      console.error('Login error:', error);
      let message = error.message || 'Failed to sign in with Google';
      if (error.code === 'auth/unauthorized-domain') {
        message = `This domain (${window.location.hostname}) is not authorized in your Firebase project. Please add it to the "Authorized domains" list in the Firebase Console (Authentication > Settings).`;
      } else if (error.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled in your Firebase project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
      }
      setAuthError(message);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('restaurant_tables');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_TABLES;
  });

  const handleConfirmBooking = () => {
    if (!selectedTable) return;
    
    const updatedTables = tables.map((t: any) => 
      t.id === selectedTable ? { ...t, status: 'booked' } : t
    );
    
    setTables(updatedTables);
    localStorage.setItem('restaurant_tables', JSON.stringify(updatedTables));
    setBookingConfirmed(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvc(value.slice(0, 3));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderPlaced(true);
    setOrderStatus('placed');
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'placed',
      type: orderType
    };
    
    try {
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOrder,
          userId: user?.uid || null
        }),
      });
      setOrderHistory(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error('Failed to save order:', error);
    }

    setCart([]);
    
    // Simulate order progress
    setTimeout(() => {
      setOrderStatus('preparing');
      setOrderHistory(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'preparing' } : o));
    }, 3000);
    setTimeout(() => {
      const status = orderType === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup';
      setOrderStatus(status);
      setOrderHistory(prev => prev.map(o => o.id === newOrder.id ? { ...o, status } : o));
    }, 7000);
    setTimeout(() => {
      const status = orderType === 'delivery' ? 'delivered' : 'picked_up';
      setOrderStatus(status);
      setOrderHistory(prev => prev.map(o => o.id === newOrder.id ? { ...o, status } : o));
    }, 11000);
  };

  const getTrackingSteps = (type: 'delivery' | 'pickup') => {
    if (type === 'delivery') {
      return [
        { id: 'placed', label: 'Order Placed', description: 'We have received your order.', icon: <ClipboardList size={20} /> },
        { id: 'preparing', label: 'Preparing', description: 'Your food is being prepared with care.', icon: <ChefHat size={20} /> },
        { id: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is on the way!', icon: <Bike size={20} /> },
        { id: 'delivered', label: 'Delivered', description: 'Enjoy your meal!', icon: <PackageCheck size={20} /> },
      ];
    }
    return [
      { id: 'placed', label: 'Order Placed', description: 'We have received your order.', icon: <ClipboardList size={20} /> },
      { id: 'preparing', label: 'Preparing', description: 'Your food is being prepared with care.', icon: <ChefHat size={20} /> },
      { id: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Your order is ready to be picked up.', icon: <Store size={20} /> },
      { id: 'picked_up', label: 'Picked Up', description: 'Enjoy your meal!', icon: <PackageCheck size={20} /> },
    ];
  };

  const isStepCompleted = (stepId: string, currentStatus: string | null) => {
    const deliveryOrder = ['placed', 'preparing', 'out_for_delivery', 'delivered'];
    const pickupOrder = ['placed', 'preparing', 'ready_for_pickup', 'picked_up'];
    
    const orderFlow = orderType === 'delivery' ? deliveryOrder : pickupOrder;
    
    const stepIndex = orderFlow.indexOf(stepId);
    const currentIndex = orderFlow.indexOf(currentStatus || 'placed');
    
    return stepIndex < currentIndex;
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = dietaryFilter === 'all' || 
                        (dietaryFilter === 'veg' && item.isVeg) || 
                        (dietaryFilter === 'non-veg' && !item.isVeg);
    return matchesSearch && matchesDiet;
  });

  const displayedMenu = (searchQuery || dietaryFilter !== 'all') ? filteredMenu : (showFullMenu ? menuItems : menuItems.slice(0, 3));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const item = menuItems.find(i => i.id === active.id);
    if (item) {
      setActiveDragItem(item);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && (over.id === 'cart-droppable' || over.id === 'cart-icon-droppable')) {
      const item = menuItems.find(i => i.id === active.id);
      if (item) {
        addToCart(item);
      }
    }
    setActiveDragItem(null);
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-cream)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-[var(--color-n8n-darker)]/80 backdrop-blur-md border-b border-[var(--color-n8n-border)]">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[var(--color-n8n-coral)] rounded-lg rotate-45 opacity-20 group-hover:rotate-90 transition-transform duration-500"></div>
            <Flame size={24} className="text-[var(--color-n8n-coral)] relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-xl tracking-tighter text-[var(--color-n8n-text)] leading-none">SAFFRON</span>
            <span className="font-mono text-[15px] uppercase tracking-tighter text-[var(--color-n8n-coral)] leading-none mt-1">& SPICE</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 text-[var(--color-n8n-text-muted)] font-mono text-xs uppercase tracking-wider">
          <a href="#about" className="hover:text-[var(--color-n8n-text)] transition-colors">Our Story</a>
          <a href="#menu" className="hover:text-[var(--color-n8n-text)] transition-colors">Menu</a>
          <a href="#reviews" className="hover:text-[var(--color-n8n-text)] transition-colors">Reviews</a>
          <a href="#visit" className="hover:text-[var(--color-n8n-text)] transition-colors">Location</a>
          <button 
            onClick={() => setIsAnalyticsOpen(true)}
            className="hover:text-[var(--color-n8n-text)] transition-colors flex items-center space-x-1"
          >
            <TrendingUp size={14} />
            <span>Metrics</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="hover:text-[var(--color-n8n-text)] transition-colors flex items-center justify-center p-2 rounded-full hover:bg-[var(--color-n8n-surface)]"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="flex items-center space-x-4 relative group">
              <div className="flex items-center space-x-2 cursor-pointer">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[var(--color-n8n-border)]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-n8n-surface)] flex items-center justify-center border border-[var(--color-n8n-border)]">
                    <User size={16} />
                  </div>
                )}
                <span className="hidden lg:block text-[var(--color-n8n-text)] truncate max-w-[100px]">{user.displayName || user.email?.split('@')[0]}</span>
              </div>
              <div className="absolute top-full right-0 mt-2 bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col border border-[var(--color-n8n-border)] overflow-hidden min-w-[150px]">
                <button 
                  onClick={() => setIsOrderHistoryOpen(true)}
                  className="px-4 py-3 hover:bg-[var(--color-n8n-border)] transition-colors flex items-center space-x-2 border-b border-[var(--color-n8n-border)] text-sm"
                >
                  <ClipboardList size={14} />
                  <span>Execution History</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-3 hover:bg-[var(--color-n8n-border)] transition-colors flex items-center space-x-2 text-sm text-[var(--color-n8n-coral)]"
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="hover:text-[var(--color-n8n-text)] transition-colors flex items-center space-x-2"
            >
              <User size={18} />
              <span>Authenticate</span>
            </button>
          )}
          <button 
            onClick={() => setIsFavoritesOpen(true)}
            className="relative hover:text-[var(--color-n8n-text)] transition-colors"
          >
            <Heart size={20} className={favorites.length > 0 ? "fill-[var(--color-n8n-coral)] text-[var(--color-n8n-coral)]" : ""} />
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-n8n-coral)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {favorites.length}
              </span>
            )}
          </button>
          <DroppableCartIcon 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-[var(--color-n8n-text)]"
            cartCount={cartCount}
            iconSize={20}
          />
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-[var(--color-n8n-coral)] text-white px-5 py-2 rounded text-xs font-bold hover:bg-[var(--color-n8n-coral-dark)] transition-colors shadow-sm"
          >
            Book a Table
          </button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center space-x-6">
          <button 
            onClick={() => setIsFavoritesOpen(true)}
            className="relative text-[var(--color-n8n-text)] hover:text-[var(--color-n8n-coral)] transition-colors z-50"
          >
            <Heart size={24} className={favorites.length > 0 ? "fill-[var(--color-n8n-coral)] text-[var(--color-n8n-coral)]" : ""} />
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-n8n-coral)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {favorites.length}
              </span>
            )}
          </button>
          <DroppableCartIcon 
            onClick={() => setIsCartOpen(true)}
            className="text-[var(--color-n8n-text)] hover:text-[var(--color-n8n-coral)] z-50"
            cartCount={cartCount}
            iconSize={24}
          />
          <button 
            className="text-[var(--color-n8n-text)] z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-xl z-[70] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-sans font-bold text-2xl text-[var(--color-n8n-text)] tracking-tight">Authentication</h2>
                  <button 
                    onClick={() => setIsLoginOpen(false)}
                    className="text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-[var(--color-n8n-text-muted)] font-light mb-8 text-sm">Sign in to save your order history, track deliveries, and manage your table reservations.</p>
                
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6 text-sm font-mono">
                    {authError}
                  </div>
                )}
                
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center space-x-3 bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] py-3 rounded-lg hover:bg-[var(--color-n8n-border)] transition-colors font-mono text-sm shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
              <div className="bg-[var(--color-n8n-darker)] p-4 text-center border-t border-[var(--color-n8n-border)]">
                <p className="text-xs text-[var(--color-n8n-text-muted)] font-mono">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[var(--color-n8n-darker)] z-40 flex flex-col items-center justify-center space-y-8 text-[var(--color-n8n-text)] text-xl font-mono tracking-wider uppercase"
          >
            {user ? (
              <div className="flex flex-col items-center space-y-4 mb-8">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-[var(--color-n8n-border)]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--color-n8n-surface)] flex items-center justify-center border-2 border-[var(--color-n8n-border)]">
                    <User size={32} />
                  </div>
                )}
                <span className="text-lg font-sans font-bold">{user.displayName || user.email}</span>
                <button 
                  onClick={() => {
                    setIsOrderHistoryOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-sm text-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-text)] transition-colors flex items-center space-x-2 mt-2"
                >
                  <ClipboardList size={16} />
                  <span>Execution History</span>
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-sm text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)] transition-colors mt-4"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="flex items-center space-x-2 text-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-text)] transition-colors mb-8"
              >
                <User size={24} />
                <span>Sign In</span>
              </button>
            )}
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-n8n-coral)] transition-colors">Our Story</a>
            <a href="#menu" onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-n8n-coral)] transition-colors">Menu</a>
            <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-n8n-coral)] transition-colors">Reviews</a>
            <a href="#visit" onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-n8n-coral)] transition-colors">Location</a>
            <button 
              onClick={() => {
                setIsAnalyticsOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 hover:text-[var(--color-n8n-coral)] transition-colors"
            >
              <TrendingUp size={24} />
              <span>Metrics</span>
            </button>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setIsBookingOpen(true);
              }}
              className="bg-[var(--color-n8n-coral)] px-8 py-3 rounded-lg mt-4 font-bold hover:bg-[var(--color-n8n-coral-dark)] transition-colors shadow-sm text-white"
            >
              Book a Table
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 hover:text-[var(--color-n8n-coral)] transition-colors mt-4"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[var(--color-n8n-surface)] border-l border-[var(--color-n8n-border)] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[var(--color-n8n-border)] flex justify-between items-center bg-[var(--color-n8n-darker)]">
                <h2 className="font-sans font-bold text-xl text-[var(--color-n8n-text)] tracking-tight">
                  {isOrderPlaced ? "Order Confirmed" : isCheckout ? "Checkout" : "Your Order"}
                </h2>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setTimeout(() => setIsCheckout(false), 300);
                  }} 
                  className="text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <DroppableCartArea isOrderPlaced={isOrderPlaced} isCheckout={isCheckout}>
                {isOrderPlaced ? (
                  <div className="h-full flex flex-col py-4">
                    <div className="text-center mb-10">
                      <h3 className="font-sans font-bold text-2xl text-[var(--color-n8n-text)] mb-2">Order Tracking</h3>
                      <p className="text-[var(--color-n8n-text-muted)] font-mono text-xs">Order ID: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                    </div>
                    
                    <div className="flex-1 relative px-4">
                      {/* Vertical line */}
                      <div className="absolute left-[39px] top-4 bottom-10 w-0.5 bg-[var(--color-n8n-border)]"></div>
                      
                      <div className="space-y-8 relative">
                        {getTrackingSteps(orderType).map((step) => {
                          const isCompleted = isStepCompleted(step.id, orderStatus);
                          const isCurrent = step.id === orderStatus;
                          
                          return (
                            <div key={step.id} className="flex items-start">
                              <div className={`
                                relative z-10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500 border
                                ${isCompleted || isCurrent ? 'bg-[var(--color-n8n-coral)]/20 border-[var(--color-n8n-coral)] text-[var(--color-n8n-coral)] shadow-sm shadow-[var(--color-n8n-coral)]/20' : 'bg-[var(--color-n8n-darker)] border-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)]'}
                              `}>
                                {step.icon}
                              </div>
                              <div className="ml-6 pt-3">
                                <h4 className={`font-mono text-sm font-bold ${isCompleted || isCurrent ? 'text-[var(--color-n8n-text)]' : 'text-[var(--color-n8n-text-muted)]'}`}>
                                  {step.label}
                                </h4>
                                {isCurrent && (
                                  <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-xs text-[var(--color-n8n-text-muted)] mt-1 font-mono"
                                  >
                                    {step.description}
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[var(--color-n8n-border)]">
                      <button 
                        onClick={() => {
                          setIsCartOpen(false);
                          setTimeout(() => {
                            setIsOrderPlaced(false);
                            setIsCheckout(false);
                            setOrderStatus(null);
                          }, 300);
                        }}
                        className="w-full bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] py-3 rounded-lg hover:bg-[var(--color-n8n-border)] transition-colors font-mono tracking-wider text-xs uppercase shadow-sm"
                      >
                        Close Tracker
                      </button>
                    </div>
                  </div>
                ) : isCheckout ? (
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                    {/* Order Type Selection */}
                    <div className="flex bg-[var(--color-n8n-darker)] p-1 rounded-lg border border-[var(--color-n8n-border)] mb-6">
                      <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`flex-1 py-2 text-xs font-mono font-bold rounded transition-all ${
                          orderType === 'delivery' 
                            ? 'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] shadow-sm border border-[var(--color-n8n-border)]' 
                            : 'text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)]'
                        }`}
                      >
                        Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('pickup')}
                        className={`flex-1 py-2 text-xs font-mono font-bold rounded transition-all ${
                          orderType === 'pickup' 
                            ? 'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] shadow-sm border border-[var(--color-n8n-border)]' 
                            : 'text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)]'
                        }`}
                      >
                        Pickup
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Your Name</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" placeholder="Enter name" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                      <input required type="email" className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" placeholder="user@domain.com" />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {orderType === 'delivery' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Delivery Address</label>
                          <textarea required className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm resize-none" rows={3} placeholder="Enter address..."></textarea>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Payment Details</label>
                      <div className="relative">
                        <input 
                          required 
                          type="text" 
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" 
                          placeholder="0000 0000 0000 0000" 
                        />
                        <div className="absolute right-3 top-3 flex space-x-2">
                          <div className="w-8 h-5 bg-[var(--color-n8n-border)] rounded"></div>
                          <div className="w-8 h-5 bg-[var(--color-n8n-border)] rounded"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <input 
                          required 
                          type="text" 
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" 
                          placeholder="MM/YY" 
                        />
                        <input 
                          required 
                          type="text" 
                          value={cvc}
                          onChange={handleCvcChange}
                          className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" 
                          placeholder="CVC" 
                        />
                      </div>
                    </div>
                  </form>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-n8n-text-muted)] space-y-4">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p className="font-mono text-sm">Your order is empty</p>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-[var(--color-n8n-coral)] font-mono text-xs hover:underline"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-3 bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] rounded-lg">
                        <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded border border-[var(--color-n8n-border)]" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-sans font-bold text-sm text-[var(--color-n8n-text)] leading-tight pr-2">{item.name}</h3>
                              <button 
                                onClick={() => updateQuantity(item.id, -item.quantity)}
                                className="text-[var(--color-n8n-text-muted)] hover:text-red-500 transition-colors mt-0.5"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[var(--color-n8n-coral)] font-mono text-xs mt-1">${item.price}</p>
                          </div>
                          <div className="flex items-center space-x-3 mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] flex items-center justify-center text-[var(--color-n8n-text-muted)] hover:border-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-coral)] transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center font-mono text-xs text-[var(--color-n8n-text)]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] flex items-center justify-center text-[var(--color-n8n-text-muted)] hover:border-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-coral)] transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DroppableCartArea>

              {!isOrderPlaced && cart.length > 0 && (
                <div className="p-6 border-t border-[var(--color-n8n-border)] bg-[var(--color-n8n-darker)]">
                  <div className="flex justify-between items-center mb-6 text-[var(--color-n8n-text)]">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-n8n-text-muted)]">Total Cost</span>
                    <span className="font-mono text-xl font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  {isCheckout ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsCheckout(false)}
                        className="px-6 py-3 rounded-lg font-mono text-xs uppercase tracking-wider border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] hover:bg-[var(--color-n8n-border)] transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        form="checkout-form"
                        type="submit"
                        className="flex-1 bg-[var(--color-n8n-coral)] text-white py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold hover:bg-[var(--color-n8n-coral-dark)] transition-colors flex justify-center items-center shadow-sm"
                      >
                        Place Order
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsCheckout(true)}
                      className="w-full bg-[var(--color-n8n-coral)] text-white py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold hover:bg-[var(--color-n8n-coral-dark)] transition-colors flex justify-center items-center shadow-sm group"
                    >
                      Proceed to Checkout
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Favorites Sidebar */}
      <AnimatePresence>
        {isFavoritesOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFavoritesOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] z-50 shadow-2xl flex flex-col border-l border-[var(--color-n8n-border)]"
            >
              <div className="p-6 border-b border-[var(--color-n8n-border)] flex justify-between items-center bg-[var(--color-n8n-darker)]">
                <h2 className="font-sans font-bold text-xl text-[var(--color-n8n-text)] tracking-tight">Favorite Dishes</h2>
                <button 
                  onClick={() => setIsFavoritesOpen(false)}
                  className="p-2 hover:bg-[var(--color-n8n-border)] rounded-lg transition-colors text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-n8n-text-muted)] space-y-6">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] flex items-center justify-center">
                      <Heart size={48} className="opacity-20" />
                    </div>
                    <p className="font-mono text-sm">No favorite dishes</p>
                    <button 
                      onClick={() => {
                        setIsFavoritesOpen(false);
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-lg border border-[var(--color-n8n-coral)] text-[var(--color-n8n-coral)] hover:bg-[var(--color-n8n-coral)] hover:text-white transition-all duration-300 font-mono text-xs uppercase tracking-wider"
                    >
                      Browse Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map(id => {
                      const dish = menuItems.find(item => item.id === id);
                      if (!dish) return null;
                      return (
                        <div key={dish.id} className="flex gap-4 bg-[var(--color-n8n-darker)] p-4 rounded-lg border border-[var(--color-n8n-border)] group hover:border-[var(--color-n8n-coral)] transition-colors">
                          <img src={dish.img} alt={dish.name} className="w-20 h-20 object-cover rounded border border-[var(--color-n8n-border)]" referrerPolicy="no-referrer" />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-sans font-bold text-sm leading-tight pr-4 text-[var(--color-n8n-text)]">{dish.name}</h4>
                                <button 
                                  onClick={() => toggleFavorite(dish.id)}
                                  className="text-[var(--color-n8n-text-muted)] hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <span className="text-[var(--color-n8n-coral)] font-mono text-xs mt-1 block">${dish.price}</span>
                            </div>
                            <button 
                              onClick={() => {
                                addToCart(dish);
                                setIsFavoritesOpen(false);
                                setIsCartOpen(true);
                              }}
                              className="self-start text-[10px] uppercase tracking-wider font-mono bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] hover:border-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-coral)] text-[var(--color-n8n-text-muted)] px-3 py-1.5 rounded transition-colors mt-2"
                            >
                              Add to Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order History Sidebar */}
      <AnimatePresence>
        {isOrderHistoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderHistoryOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] z-50 shadow-2xl flex flex-col border-l border-[var(--color-n8n-border)]"
            >
              <div className="p-6 border-b border-[var(--color-n8n-border)] flex justify-between items-center bg-[var(--color-n8n-darker)]">
                <h2 className="font-sans font-bold text-xl text-[var(--color-n8n-text)] tracking-tight">Order History</h2>
                <button 
                  onClick={() => setIsOrderHistoryOpen(false)}
                  className="p-2 hover:bg-[var(--color-n8n-border)] rounded-lg transition-colors text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {orderHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-n8n-text-muted)] space-y-6">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] flex items-center justify-center">
                      <ClipboardList size={48} className="opacity-20" />
                    </div>
                    <p className="font-mono text-sm">No past orders</p>
                    <button 
                      onClick={() => {
                        setIsOrderHistoryOpen(false);
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-lg border border-[var(--color-n8n-coral)] text-[var(--color-n8n-coral)] hover:bg-[var(--color-n8n-coral)] hover:text-white transition-all duration-300 font-mono text-xs uppercase tracking-wider"
                    >
                      Browse Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map(order => (
                      <div key={order.id} className="bg-[var(--color-n8n-darker)] p-5 rounded-lg border border-[var(--color-n8n-border)] flex flex-col hover:border-[var(--color-n8n-coral)] transition-colors">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--color-n8n-border)]">
                          <div>
                            <span className="text-[10px] font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider">Order #{order.id}</span>
                            <div className="text-sm mt-1 font-sans text-[var(--color-n8n-text)]">{new Date(order.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[var(--color-n8n-coral)] font-mono text-sm">${order.total.toFixed(2)}</span>
                            <div className="text-[10px] font-mono text-[var(--color-n8n-text-muted)] mt-1 uppercase">{order.type}</div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-mono">
                              <span className="text-[var(--color-n8n-text-muted)]">{item.quantity}x <span className="text-[var(--color-n8n-text)]">{item.name}</span></span>
                              <span className="text-[var(--color-n8n-text-muted)]">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-[var(--color-n8n-border)] flex justify-between items-center">
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)] uppercase tracking-wider">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <button 
                            onClick={() => {
                              setCart(prev => {
                                const newCart = [...prev];
                                order.items.forEach(orderItem => {
                                  const existing = newCart.find(i => i.id === orderItem.id);
                                  if (existing) {
                                    existing.quantity += orderItem.quantity;
                                  } else {
                                    newCart.push({ ...orderItem });
                                  }
                                });
                                return newCart;
                              });
                              setIsOrderHistoryOpen(false);
                              setIsCartOpen(true);
                            }}
                            className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-text)] transition-colors"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {isAnalyticsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnalyticsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] z-50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[var(--color-n8n-border)] flex justify-between items-center bg-[var(--color-n8n-darker)]">
                <h2 className="font-sans font-bold text-xl text-[var(--color-n8n-text)] flex items-center gap-2 tracking-tight">
                  <TrendingUp size={20} className="text-[var(--color-n8n-coral)]" />
                  System Metrics
                </h2>
                <button 
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="p-2 hover:bg-[var(--color-n8n-border)] rounded-lg transition-colors text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-n8n-surface)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[var(--color-n8n-darker)] p-6 rounded-lg shadow-sm border border-[var(--color-n8n-border)]">
                    <h3 className="text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Total Orders</h3>
                    <p className="text-2xl font-sans font-bold text-[var(--color-n8n-text)]">12,450</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-mono">
                      <TrendingUp size={12} /> +14.5% from last month
                    </p>
                  </div>
                  <div className="bg-[var(--color-n8n-darker)] p-6 rounded-lg shadow-sm border border-[var(--color-n8n-border)]">
                    <h3 className="text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Favorite Dish</h3>
                    <p className="text-2xl font-sans font-bold text-[var(--color-n8n-text)]">Murgh Makhani</p>
                    <p className="text-xs text-[var(--color-n8n-text-muted)] mt-2 font-mono">342 triggers this month</p>
                  </div>
                  <div className="bg-[var(--color-n8n-darker)] p-6 rounded-lg shadow-sm border border-[var(--color-n8n-border)]">
                    <h3 className="text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Active Orders</h3>
                    <p className="text-2xl font-sans font-bold text-[var(--color-n8n-text)]">856</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-mono">
                      <TrendingUp size={12} /> +8.2% from last month
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--color-n8n-darker)] p-6 rounded-lg shadow-sm border border-[var(--color-n8n-border)] mb-8">
                  <h3 className="text-sm font-sans font-bold text-[var(--color-n8n-text)] mb-6">Order Volume (Last 6 Months)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Oct', sales: 8400 },
                        { name: 'Nov', sales: 9200 },
                        { name: 'Dec', sales: 14500 },
                        { name: 'Jan', sales: 10800 },
                        { name: 'Feb', sales: 11200 },
                        { name: 'Mar', sales: 12450 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-n8n-border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-n8n-text-muted)', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-n8n-text-muted)', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(value) => `${value}`} dx={-10} />
                        <Tooltip 
                          cursor={{ fill: 'var(--color-n8n-surface)' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-n8n-border)', backgroundColor: 'var(--color-n8n-darker)', color: 'white', fontFamily: 'monospace', fontSize: '12px' }}
                          formatter={(value: number) => [`${value}`, 'Orders']}
                        />
                        <Bar dataKey="sales" fill="var(--color-n8n-coral)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] z-50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[var(--color-n8n-border)] flex justify-between items-center bg-[var(--color-n8n-darker)]">
                <h2 className="font-sans font-bold text-xl text-[var(--color-n8n-text)] tracking-tight">
                  {bookingConfirmed ? "Allocation Confirmed" : "Allocate Resource"}
                </h2>
                <button 
                  onClick={() => {
                    setIsBookingOpen(false);
                    setTimeout(() => {
                      setSelectedTable(null);
                      setBookingConfirmed(false);
                    }, 300);
                  }} 
                  className="text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-n8n-surface)]">
                {bookingConfirmed ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-16 h-16 bg-[var(--color-n8n-coral)]/20 text-[var(--color-n8n-coral)] border border-[var(--color-n8n-coral)] rounded-full flex items-center justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </div>
                    <h3 className="font-sans font-bold text-2xl text-[var(--color-n8n-text)]">Table Booked!</h3>
                    <p className="text-[var(--color-n8n-text-muted)] font-mono text-sm">Your table has been successfully booked. Awaiting confirmation.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center space-x-6 mb-8 text-xs font-mono text-[var(--color-n8n-text-muted)]">
                      <div className="flex items-center"><div className="w-3 h-3 rounded bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] mr-2"></div> Available</div>
                      <div className="flex items-center"><div className="w-3 h-3 rounded bg-[var(--color-n8n-coral)] mr-2"></div> Selected</div>
                      <div className="flex items-center"><div className="w-3 h-3 rounded bg-[var(--color-n8n-border)] mr-2"></div> Allocated</div>
                    </div>
                    
                    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-[var(--color-n8n-darker)] rounded-lg border border-[var(--color-n8n-border)] shadow-inner p-8 overflow-hidden">
                      {/* Grid Background */}
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-n8n-border) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }}></div>

                      {/* Layout structural elements */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[var(--color-n8n-surface)] px-6 py-2 rounded-b text-[10px] font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider border-b border-x border-[var(--color-n8n-border)] z-10">
                        Processing Unit
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[var(--color-n8n-surface)] px-6 py-2 rounded-t text-[10px] font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider border-t border-x border-[var(--color-n8n-border)] z-10">
                        Ingress
                      </div>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-[var(--color-n8n-surface)]/50 h-3/4 w-8 rounded-l border-l border-y border-[var(--color-n8n-border)] flex items-center justify-center z-10">
                        <span className="writing-vertical-rl text-[10px] font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>Delivery Partner</span>
                      </div>
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-[var(--color-n8n-surface)]/50 h-2/3 w-8 rounded border border-[var(--color-n8n-border)] flex items-center justify-center z-10">
                        <span className="writing-vertical-rl text-[10px] font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>Kitchen</span>
                      </div>

                      {/* Tables */}
                      {tables.map((table: any) => {
                        const isSelected = selectedTable === table.id;
                        const isBooked = table.status === 'booked';
                        
                        return (
                          <button
                            key={table.id}
                            disabled={isBooked}
                            onClick={() => setSelectedTable(table.id)}
                            className={`absolute flex flex-col items-center justify-center transition-all z-20 ${
                              isBooked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
                            }`}
                            style={{ left: `${table.x}%`, top: `${table.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            <div className={`
                              flex items-center justify-center font-mono text-xs rounded shadow-sm transition-colors
                              ${table.type === '1-seater' ? 'w-8 h-8 rounded-full' : table.type === '2-seater' ? 'w-12 h-12' : table.type === '4-seater' ? 'w-16 h-16' : 'w-20 h-16'}
                              ${isSelected ? 'bg-[var(--color-n8n-coral)] text-white border border-[var(--color-n8n-coral)]' : 
                                isBooked ? 'bg-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)] border border-[var(--color-n8n-border)]' : 
                                'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text-muted)] border border-[var(--color-n8n-border)] hover:border-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-text)]'}
                            `}>
                              {table.label}
                            </div>
                            <span className="text-[8px] font-mono text-[var(--color-n8n-text-muted)] mt-1 uppercase">{table.type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {!bookingConfirmed && (
                <div className="p-6 border-t border-[var(--color-n8n-border)] bg-[var(--color-n8n-darker)] flex justify-end">
                  <button 
                    disabled={!selectedTable}
                    onClick={handleConfirmBooking}
                    className={`px-6 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors flex items-center ${
                      selectedTable 
                        ? 'bg-[var(--color-n8n-coral)] text-white hover:bg-[var(--color-n8n-coral-dark)]' 
                        : 'bg-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)] cursor-not-allowed'
                    }`}
                  >
                    Confirm Allocation
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-n8n-darker)] pt-20"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Mouse Halo */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-500"
          style={{ opacity: isHovering ? 1 : 0 }}
        >
          <div 
            className="absolute w-[800px] h-[800px] bg-[var(--color-n8n-coral)] rounded-full mix-blend-screen filter blur-[200px] opacity-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
            style={{ left: mousePosition.x, top: mousePosition.y }}
          />
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-n8n-coral)] rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-n8n-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-n8n-border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }}></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-n8n-coral)] animate-pulse"></span>
            <span className="text-[var(--color-n8n-text-muted)] text-sm font-medium">New: AI-Powered Menu Recommendations</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold text-[var(--color-n8n-text)] mb-8 leading-[1.1] tracking-tight"
          >
            Elevate your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-n8n-coral)] to-orange-400">
              dining experience
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-[var(--color-n8n-text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light"
          >
            Connect your appetite to our kitchen. Build custom flavor profiles, track your orders in real-time, and experience gastronomy crafted for the modern palate.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <a href="#menu" className="w-full sm:w-auto bg-[var(--color-n8n-coral)] text-white px-8 py-4 rounded-lg text-base font-semibold hover:bg-[var(--color-n8n-coral-dark)] transition-all flex items-center justify-center shadow-lg shadow-[var(--color-n8n-coral)]/20">
              Order Now
              <ChevronRight className="ml-2" size={20} />
            </a>
            <button onClick={() => setIsBookingOpen(true)} className="w-full sm:w-auto bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] border border-[var(--color-n8n-border)] px-8 py-4 rounded-lg text-base font-semibold hover:bg-[var(--color-n8n-border)] transition-all flex items-center justify-center">
              Book a Table
            </button>
          </motion.div>
          
          {/* Decorative UI below hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-20 relative max-w-3xl mx-auto"
          >
            <div className="node-card p-4 flex items-center justify-between bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-xl shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <ChefHat size={24} />
                </div>
                <div className="text-left">
                  <div className="text-[var(--color-n8n-text)] font-semibold">Kitchen</div>
                  <div className="text-[var(--color-n8n-text-muted)] text-sm">Preparing order...</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[var(--color-n8n-text-muted)] font-mono">Status: Received</span>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-n8n-coral)] to-orange-400"></div>
              
              <div className="flex items-center space-x-2 mb-6 border-b border-[var(--color-n8n-border)] pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-xs font-mono text-[var(--color-n8n-text-muted)]">our_menu.pdf</span>
              </div>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-n8n-darker)] rounded-lg border border-[var(--color-n8n-border)]">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400"><Store size={16} /></div>
                  <div className="flex-1">
                    <div className="text-[var(--color-n8n-text)]">Source Ingredients</div>
                    <div className="text-xs text-[var(--color-n8n-text-muted)]">Kerala Farms</div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-n8n-text-muted)]" />
                </div>
                
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-[var(--color-n8n-border)]"></div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-n8n-darker)] rounded-lg border border-[var(--color-n8n-coral)] shadow-[0_0_15px_rgba(255,109,90,0.15)] relative">
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-n8n-coral)]"></div>
                  <div className="w-8 h-8 rounded bg-[var(--color-n8n-coral)]/20 flex items-center justify-center text-[var(--color-n8n-coral)]"><ChefHat size={16} /></div>
                  <div className="flex-1">
                    <div className="text-[var(--color-n8n-text)]">Cooking</div>
                    <div className="text-xs text-[var(--color-n8n-coral)]">In Progress • 45m remaining</div>
                  </div>
                  <div className="animate-spin w-4 h-4 border-2 border-[var(--color-n8n-coral)] border-t-transparent rounded-full"></div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-[var(--color-n8n-border)]"></div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-n8n-darker)] rounded-lg border border-[var(--color-n8n-border)] opacity-50">
                  <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-400"><PackageCheck size={16} /></div>
                  <div className="flex-1">
                    <div className="text-[var(--color-n8n-text)]">Serve to Table</div>
                    <div className="text-xs text-[var(--color-n8n-text-muted)]">Waiting for preparation</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-full px-3 py-1 mb-6">
              <span className="text-[var(--color-n8n-coral)] font-mono text-xs font-bold uppercase tracking-wider">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-8 text-[var(--color-n8n-text)] leading-[1.1] tracking-tight">
              Rooted in tradition, <br/><span className="text-[var(--color-n8n-text-muted)]">engineered with passion.</span>
            </h2>
            <div className="space-y-6 text-[var(--color-n8n-text-muted)] font-light text-lg">
              <p>
                At Saffron & Spice, we treat recipes like family secrets. We bring the vibrant streets of Delhi and the royal kitchens of Rajasthan straight to your table, preparing each dish with precision.
              </p>
              <p>
                We source our spices directly from the finest farms in Kerala, ensuring that every step in our supply chain is optimized for maximum flavor and freshness.
              </p>
            </div>
            <button className="mt-12 text-[var(--color-n8n-coral)] hover:text-[var(--color-n8n-coral-dark)] transition-colors uppercase tracking-[0.15em] text-xs font-bold group flex items-center">
              View Documentation
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="py-32 bg-[var(--color-n8n-dark)] text-[var(--color-n8n-text)] px-6 md:px-12 overflow-hidden border-t border-[var(--color-n8n-border)]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-full px-3 py-1 mb-6">
              <span className="text-[var(--color-n8n-coral)] font-mono text-xs font-bold uppercase tracking-wider">Menu Categories</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold mb-8 tracking-tight">Our Menu</h2>
            <p className="text-[var(--color-n8n-text-muted)] max-w-2xl mx-auto font-light leading-relaxed text-lg mb-10">A curated selection of our most powerful flavor profiles, ready to be integrated into your dining experience.</p>
            
            <div className="relative max-w-md mx-auto mb-6">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className="text-[var(--color-n8n-text-muted)]" />
              </div>
              <input 
                type="text" 
                placeholder="Search components..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-lg text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-n8n-coral)] focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setDietaryFilter('all')}
                className={`px-6 py-2 rounded-lg text-sm font-mono transition-colors ${dietaryFilter === 'all' ? 'bg-[var(--color-n8n-coral)] text-white' : 'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text-muted)] hover:bg-[var(--color-n8n-border)] border border-[var(--color-n8n-border)]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setDietaryFilter('veg')}
                className={`px-6 py-2 rounded-lg text-sm font-mono transition-colors flex items-center ${dietaryFilter === 'veg' ? 'bg-green-600 text-white border-green-500' : 'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text-muted)] hover:bg-[var(--color-n8n-border)] border border-[var(--color-n8n-border)]'}`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                Veg
              </button>
              <button 
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-6 py-2 rounded-lg text-sm font-mono transition-colors flex items-center ${dietaryFilter === 'non-veg' ? 'bg-red-600 text-white border-red-500' : 'bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text-muted)] hover:bg-[var(--color-n8n-border)] border border-[var(--color-n8n-border)]'}`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                Non-Veg
              </button>
            </div>
          </motion.div>          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            <AnimatePresence>
              {displayedMenu.length > 0 ? displayedMenu.map((dish, index) => (
                <DraggableMenuItem 
                  key={dish.id} 
                  dish={dish} 
                  index={index} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  expandedItems={expandedItems} 
                  toggleExpand={toggleExpand} 
                  addToCart={addToCart} 
                  rating={dishRatings[dish.name]}
                />
              )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 font-light text-lg">No dishes found matching your search.</p>
              </div>
            )}
            </AnimatePresence>
          </div>
          
          {!searchQuery && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-20"
            >
              <button 
                onClick={() => setShowFullMenu(!showFullMenu)}
                className="border border-white/30 px-10 py-4 rounded-full hover:bg-white hover:text-[var(--color-ink)] transition-colors uppercase tracking-[0.15em] text-xs font-medium"
              >
                {showFullMenu ? "Show Less" : "View Full Menu"}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-32 bg-[var(--color-n8n-darker)] px-6 md:px-12 overflow-hidden border-t border-[var(--color-n8n-border)] relative">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-n8n-surface)] to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-n8n-coral)] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-full px-3 py-1 mb-6">
              <span className="text-[var(--color-n8n-coral)] font-mono text-xs font-bold uppercase tracking-wider">Customer Reviews</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold mb-8 text-[var(--color-n8n-text)] tracking-tight">User Reviews</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {reviews.map((review, index) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="node-card p-8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[var(--color-n8n-border)] pb-4">
                  <div className="flex space-x-1 text-[var(--color-n8n-coral)]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-[var(--color-n8n-text-muted)]">Verified Review</span>
                </div>
                <p className="text-[var(--color-n8n-text)] font-light leading-relaxed flex-1 mb-8">"{review.comment}"</p>
                {review.dish && (
                  <div className="mb-6 bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] rounded p-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-n8n-coral)] mr-3"></div>
                    <span className="text-xs font-mono text-[var(--color-n8n-text-muted)]">Dish: {review.dish}</span>
                  </div>
                )}
                <div className="flex items-center mt-auto">
                  <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-lg object-cover mr-4 border border-[var(--color-n8n-border)]" referrerPolicy="no-referrer" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--color-n8n-text)] text-sm">{review.name}</span>
                    <span className="text-xs font-mono text-[var(--color-n8n-text-muted)]">Verified User</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[var(--color-n8n-surface)] text-[var(--color-n8n-text)] border border-[var(--color-n8n-border)] px-8 py-3 rounded-lg hover:bg-[var(--color-n8n-border)] transition-colors font-mono text-sm uppercase tracking-wider flex items-center justify-center mx-auto group"
            >
              <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Submit Reviews
            </button>
          </motion.div>
        </div>
      </section>

      {/* Add Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] rounded-xl z-[70] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-sans font-bold text-2xl text-[var(--color-n8n-text)] tracking-tight">Submit Reviews</h2>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-[var(--color-n8n-text-muted)] hover:text-[var(--color-n8n-text)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleAddReview} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm" 
                      placeholder="Enter name" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Your Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({...newReview, rating: star})}
                          className={`p-1 transition-colors ${newReview.rating >= star ? 'text-[var(--color-n8n-coral)]' : 'text-[var(--color-n8n-border)] hover:text-[var(--color-n8n-text-muted)]'}`}
                        >
                          <Star size={24} fill={newReview.rating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Favorite Dish (Optional)</label>
                      <select 
                        value={newReview.dish}
                        onChange={(e) => setNewReview({...newReview, dish: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all font-mono text-sm appearance-none"
                      >
                        <option value="">Select a dish</option>
                        {menuItems.map(item => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-n8n-text-muted)] uppercase tracking-wider mb-2">Your Review</label>
                    <textarea 
                      required 
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-n8n-darker)] border border-[var(--color-n8n-border)] text-[var(--color-n8n-text)] placeholder-[var(--color-n8n-text-muted)] focus:outline-none focus:border-[var(--color-n8n-coral)] transition-all resize-none font-mono text-sm" 
                      placeholder="Describe your experience..." 
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-colors flex justify-center items-center ${
                      isSubmittingReview 
                        ? 'bg-[var(--color-n8n-border)] text-[var(--color-n8n-text-muted)] cursor-not-allowed' 
                        : 'bg-[var(--color-n8n-coral)] text-white hover:bg-[var(--color-n8n-coral-dark)]'
                    }`}
                  >
                    {isSubmittingReview ? 'Processing...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Visit / Footer */}
      <footer id="visit" className="bg-[var(--color-n8n-darker)] text-[var(--color-n8n-text-muted)] pt-32 pb-12 px-6 md:px-12 overflow-hidden border-t border-[var(--color-n8n-border)]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--color-n8n-coral)] rounded-lg rotate-45 opacity-20"></div>
                <Flame size={24} className="text-[var(--color-n8n-coral)] relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-xl tracking-tighter text-[var(--color-n8n-text)] leading-none">SAFFRON</span>
                <span className="font-sans text-[15px] uppercase tracking-[0.3em] text-[var(--color-n8n-coral)] leading-none mt-1">& SPICE</span>
              </div>
            </div>
            <p className="max-w-md font-light leading-relaxed mb-10 text-sm">
              Experience the true essence of Indian hospitality. Join us for an unforgettable dining experience where every meal is a celebration of flavor and tradition, engineered for the modern palate.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] flex items-center justify-center hover:bg-[var(--color-n8n-border)] hover:text-[var(--color-n8n-text)] transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] flex items-center justify-center hover:bg-[var(--color-n8n-border)] hover:text-[var(--color-n8n-text)] transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded bg-[var(--color-n8n-surface)] border border-[var(--color-n8n-border)] flex items-center justify-center hover:bg-[var(--color-n8n-border)] hover:text-[var(--color-n8n-text)] transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-[var(--color-n8n-text)] font-mono font-bold uppercase tracking-wider text-xs mb-8">Location</h3>
            <ul className="space-y-6 font-light text-sm">
              <li className="flex items-start group">
                <MapPin size={18} className="mr-4 mt-0.5 shrink-0 text-[var(--color-n8n-coral)]" />
                <span>123 Culinary Avenue,<br/>Food District, NY 10001</span>
              </li>
              <li className="flex items-center group">
                <Phone size={18} className="mr-4 text-[var(--color-n8n-coral)]" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-[var(--color-n8n-text)] font-mono font-bold uppercase tracking-wider text-xs mb-8">Opening Hours</h3>
            <ul className="space-y-4 font-light text-sm">
              <li className="flex justify-between border-b border-[var(--color-n8n-border)] pb-3">
                <span>Mon - Thu</span>
                <span className="font-mono text-xs">11:30 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-[var(--color-n8n-border)] pb-3">
                <span>Fri - Sat</span>
                <span className="font-mono text-xs">11:30 - 23:00</span>
              </li>
              <li className="flex justify-between border-b border-[var(--color-n8n-border)] pb-3">
                <span>Sunday</span>
                <span className="font-mono text-xs">12:00 - 21:30</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-[var(--color-n8n-border)] pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-[var(--color-n8n-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Saffron & Spice. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[var(--color-n8n-text)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-n8n-text)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <DragOverlay>
        {activeDragItem ? (
          <div className="w-64 bg-[var(--color-n8n-surface)] border-2 border-[var(--color-n8n-coral)] rounded-xl overflow-hidden shadow-2xl opacity-90 rotate-3">
            <img 
              src={activeDragItem.img} 
              alt={activeDragItem.name} 
              className="w-full h-32 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-3">
              <h3 className="text-sm font-sans font-bold text-[var(--color-n8n-text)]">{activeDragItem.name}</h3>
              <span className="text-[var(--color-n8n-text)] font-mono font-bold text-xs">${activeDragItem.price}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
  );
}
