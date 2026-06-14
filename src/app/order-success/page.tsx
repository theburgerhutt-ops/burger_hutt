'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag, Receipt, Bell, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { io } from 'socket.io-client';

const OrderSuccessPage = () => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  // Audio Play Chime Logic
  const playAlarmBell = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1811/1811-preview.mp3');
      audio.volume = 1.0;
      audio.loop = true; // Ring continuously as an alarm until closed!
      
      // Store in window to allow turning it off when closed
      (window as any)._activeOrderAlarm = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log('Audio playback prevented by browser', error));
      }
    } catch (e) {
      console.log('Audio chime error', e);
    }
  };

  const stopAlarmBell = () => {
    try {
      const activeAlarm = (window as any)._activeOrderAlarm;
      if (activeAlarm) {
        activeAlarm.pause();
        activeAlarm.currentTime = 0;
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 1. Fetch order details on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setOrderId(id);

    const fetchOrder = async (idVal: string) => {
      try {
        const res = await fetch(`/api/orders/${idVal}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        
        if (data) {
          setOrder(data);
          // If already ready, show alarm
          if (data.status === 'ready') {
            setShowAlarmModal(true);
            playAlarmBell();
          }
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder(id);

      // 2. Setup real-time postgres listener specifically for this order row update
      const channel = supabase
        .channel(`order-tracker-${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
          (payload) => {
            const updated = payload.new;
            setOrder(updated);
            if (updated.status === 'ready') {
              setShowAlarmModal(true);
              playAlarmBell();
            }
          }
        )
        .subscribe();

      // 3. Setup Socket.io listener for both local and Supabase real-time updates
      const socket = io();
      socket.on('order-updated', (updated: any) => {
        if (updated.id === id || updated.order_id === id) {
          setOrder(updated);
          if (updated.status === 'ready') {
            setShowAlarmModal(true);
            playAlarmBell();
          }
        }
      });

      return () => {
        channel.unsubscribe();
        socket.disconnect();
        stopAlarmBell();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return '● Pending Verification';
      case 'preparing':
        return '🍳 Preparing gourmet meal';
      case 'ready':
        return '🔔 READY FOR PICKUP!';
      case 'delivered':
        return '✓ Delivered & Closed';
      case 'cancelled':
        return '✗ Cancelled';
      default:
        return '● Processing';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return '#FFB800';
      case 'preparing':
        return '#00B8D4';
      case 'ready':
        return '#9B59B6'; // Royal Purple for ready status!
      case 'delivered':
        return '#36B37E';
      case 'cancelled':
        return '#FF5630';
      default:
        return '#FFB800';
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at center, rgba(30, 20, 15, 0.4) 0%, rgba(10, 5, 3, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 20px'
      }}
    >
      {/* Decorative Background Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '500px',
        background: 'rgba(212, 164, 75, 0.05)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Real-time Order Tracker Layout */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'rgba(18, 13, 11, 0.75)',
          border: '1px solid rgba(212, 164, 75, 0.25)',
          backdropFilter: 'blur(25px)',
          padding: '45px 35px',
          textAlign: 'center',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 1,
          margin: '0 20px'
        }}
      >
        {/* Luxury Gold Corners */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />

        {/* Dynamic Badge Header */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
            style={{
              width: '76px',
              height: '76px',
              background: order?.status === 'ready' ? '#9B59B6' : '#D4A44B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: order?.status === 'ready' 
                ? '0 0 50px rgba(155, 89, 182, 0.45)' 
                : '0 0 50px rgba(212, 164, 75, 0.35)',
              transition: 'all 0.5s ease'
            }}
          >
            {order?.status === 'ready' ? (
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
              >
                <Bell size={38} color="#fff" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <CheckCircle size={38} color="#000" strokeWidth={2.5} />
            )}
          </motion.div>
        </div>

        <span style={{
          fontSize: '10px',
          color: order?.status === 'ready' ? '#9B59B6' : 'var(--primary)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '6px',
          fontWeight: 700
        }}>
          {order?.status === 'ready' ? '— MEAL COMPLETED —' : '— RESERVATION SAVED —'}
        </span>
        
        <h1 
          className="font-cormorant text-white font-bold" 
          style={{ 
            fontSize: '2.4rem', 
            marginBottom: '15px', 
            letterSpacing: '0.02em',
            lineHeight: 1.2
          }}
        >
          {order?.status === 'ready' ? (
            <>Your Burger is <span style={{ color: '#9B59B6', fontStyle: 'italic' }}>Ready!</span></>
          ) : (
            <>Order <span style={{ color: '#D4A44B', fontStyle: 'italic' }}>Confirmed!</span></>
          )}
        </h1>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '30px', fontSize: '0.92rem', lineHeight: '1.6' }}>
          {order?.status === 'ready' 
            ? 'Ding Dong! Our kitchen team has finalized your gourmet meal. It is served fresh and extremely hot. Please collect it immediately!'
            : 'Thank you for choosing Burger Hut. Your gourmet order has been successfully saved in our database. Our kitchen staff is preparing it with ultimate care.'
          }
        </p>

        {/* Live Vintage Receipt Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            border: `1px dashed ${order?.status === 'ready' ? 'rgba(155, 89, 182, 0.5)' : 'rgba(212, 164, 75, 0.3)'}`,
            background: 'rgba(18, 13, 11, 0.4)',
            padding: '20px',
            marginBottom: '35px',
            textAlign: 'left',
            position: 'relative',
            transition: 'all 0.5s ease'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: order?.status === 'ready' ? '#9B59B6' : '#D4A44B', 
            marginBottom: '15px', 
            borderBottom: '1px solid rgba(212, 164, 75, 0.1)', 
            paddingBottom: '10px',
            transition: 'all 0.5s ease'
          }}>
            <Receipt size={16} />
            <span style={{ fontSize: '10px', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase' }}>Kitchen Receipt Summary</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ opacity: 0.5 }}>Order ID:</span>
              <span style={{ color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{order?.order_id || 'ORD-BH-######'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ opacity: 0.5 }}>Order Status:</span>
              <span style={{ color: getStatusColor(order?.status || 'pending_verification'), fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {getStatusText(order?.status || 'pending_verification')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ opacity: 0.5 }}>Service Option:</span>
              <span style={{ color: '#D4A44B', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>{order?.customer_address || 'Dine-In'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.5 }}>Bill Total:</span>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '12px' }}>₹{order?.total_amount || '0'}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link 
            href="/" 
            style={{
              flex: 1,
              padding: '14px 20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.8rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D4A44B';
              e.currentTarget.style.color = '#D4A44B';
              e.currentTarget.style.background = 'rgba(212, 164, 75, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Home size={14} /> Back to Home
          </Link>
          
          <Link 
            href="/menu" 
            style={{
              flex: 1,
              padding: '14px 20px',
              background: order?.status === 'ready' ? '#9B59B6' : '#D4A44B',
              color: order?.status === 'ready' ? 'white' : 'black',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.8rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = order?.status === 'ready' ? '#9B59B6' : '#D4A44B';
              e.currentTarget.style.color = order?.status === 'ready' ? 'white' : 'black';
            }}
          >
            <ShoppingBag size={14} /> Order More
          </Link>
        </div>

        <p style={{
          marginTop: '35px',
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          fontWeight: 600
        }}>
          Keep this window open. Order statuses update live.
        </p>
      </motion.div>

      {/* FULL-SCREEN GORGEOUS ALARM OVERLAY MODAL */}
      <AnimatePresence>
        {showAlarmModal && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 3, 2, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              backdropFilter: 'blur(30px)',
              padding: '20px'
            }}
          >
            {/* Pulsing Alarm Background Aura */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(155, 89, 182, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              style={{
                maxWidth: '480px',
                width: '100%',
                background: '#120D0B',
                border: '2px solid #9B59B6',
                boxShadow: '0 0 50px rgba(155, 89, 182, 0.4)',
                padding: '40px 30px',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Luxury Gold Corners inside the Alarm Modal */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid #9B59B6', borderLeft: '2px solid #9B59B6' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid #9B59B6', borderRight: '2px solid #9B59B6' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid #9B59B6', borderLeft: '2px solid #9B59B6' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid #9B59B6', borderRight: '2px solid #9B59B6' }} />

              <motion.div
                animate={{ rotate: [-20, 20, -20, 20, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 0.5 }}
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'rgba(155, 89, 182, 0.1)',
                  border: '2px dashed #9B59B6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  color: '#9B59B6'
                }}
              >
                <Bell size={44} strokeWidth={2} />
              </motion.div>

              <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9B59B6', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                🔔 LIVE SERVICE ALERT 🔔
              </span>
              
              <h2 className="font-cormorant" style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900, marginBottom: '15px', lineHeight: 1.1 }}>
                YOUR BURGER IS <span style={{ color: '#9B59B6', fontStyle: 'italic' }}>READY!</span>
              </h2>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '35px' }}>
                The service bell is ringing! Our master chefs have cooked and garnished your order (ID: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{order?.order_id}</strong>) to gourmet perfection. Collect it hot from the counter!
              </p>

              <button
                onClick={() => {
                  setShowAlarmModal(false);
                  stopAlarmBell();
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#9B59B6',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(155, 89, 182, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#9B59B6';
                  e.currentTarget.style.color = 'white';
                }}
              >
                ✓ DISMISS & COLLECT MEAL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSuccessPage;
