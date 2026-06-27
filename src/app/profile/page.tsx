'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShoppingBag, Clock, Heart, Calendar, ShieldCheck, User, Bell, Star, Upload, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/app/actions/auth';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [readyOrder, setReadyOrder] = useState<any>(null);

  // Reviews submission states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const router = useRouter();

  // Load basic customer info and orders directly from client-side Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);
        setReviewName(currentUser?.user_metadata?.full_name || '');

        const { data: userOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!ordersError && userOrders) {
          setOrders(userOrders);
        }
      } catch (err) {
        console.error('Error loading dynamic profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Real-time Postgres Row UPDATE channel listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updated = payload.new;
          
          // Trigger service bell chime and show overlay if order moves to 'ready' status
          if (updated.status === 'ready') {
            setReadyOrder(updated);
            setShowAlarmModal(true);
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1811/1811-preview.mp3');
              audio.volume = 1.0;
              audio.loop = true; // Loop chime until dismissed by user
              (window as any)._activeProfileAlarm = audio;
              
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => console.log('Audio playback prevented by browser settings', error));
              }
            } catch (e) {
              console.log('Chime error', e);
            }
          }

          // Dynamically map and update modified values inside orders state list
          setOrders(prev => prev.map(o => o.id === updated.id ? { 
            ...o, 
            status: updated.status, 
            payment_status: updated.payment_status 
          } : o));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      try {
        const activeAlarm = (window as any)._activeProfileAlarm;
        if (activeAlarm) {
          activeAlarm.pause();
          activeAlarm.currentTime = 0;
        }
      } catch (e) {
        console.log(e);
      }
    };
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const stopAlarmBell = () => {
    try {
      const activeAlarm = (window as any)._activeProfileAlarm;
      if (activeAlarm) {
        activeAlarm.pause();
        activeAlarm.currentTime = 0;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to ~5MB to avoid payload limits
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit. Please upload a smaller image or video.');
      return;
    }

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaFileType(type);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaFile(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewName.trim()) {
      alert('Please fill out your name and experience details!');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          name: reviewName,
          rating: reviewRating,
          text: reviewText,
          media_url: mediaFile,
          media_type: mediaFileType,
          approved: false // False by default for admin approval flow!
        });

      if (error) throw error;

      alert('⚡ GOURMET FEEDBACK SUBMITTED!\n\nYour review has been successfully sent to our Admin Panel for verification. Once approved, it will be published live!');
      setReviewText('');
      setMediaFile(null);
      setMediaFileType(null);
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please check your Supabase schema settings.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B0705',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '2px solid rgba(212, 164, 75, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || 'Valued Connoisseur';
  const email = user?.email || '';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalSpent = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <Header />
      
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(212, 164, 75, 0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: -1
      }} />

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '180px 20px 100px 20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Profile Card Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(18, 13, 11, 0.7)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(15px)',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            marginBottom: '40px',
            position: 'relative'
          }}
        >
          {/* Gold Corners */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '15px', height: '15px', borderTop: '1px solid var(--primary)', borderLeft: '1px solid var(--primary)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '15px', height: '15px', borderTop: '1px solid var(--primary)', borderRight: '1px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '15px', height: '15px', borderBottom: '1px solid var(--primary)', borderLeft: '1px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '15px', height: '15px', borderBottom: '1px solid var(--primary)', borderRight: '1px solid var(--primary)' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px', justifyContent: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #E6C27A 100%)',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 0 25px rgba(212, 164, 75, 0.4)',
              letterSpacing: '-0.05em'
            }}>
              {initials || 'C'}
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '5px' }}>
                Connoisseur Club Member
              </span>
              <h2 style={{ fontSize: '2.2rem', color: 'white', fontWeight: 700, margin: 0, fontFamily: 'var(--font-cormorant)' }}>
                {fullName}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
                {email}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/admin"
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(212, 164, 75, 0.4)',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'transparent',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212, 164, 75, 0.1)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(212, 164, 75, 0.4)';
              }}
            >
              <ShieldCheck size={14} /> ADMIN CONSOLE
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
            >
              <LogOut size={14} /> {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
            </button>
          </div>
        </motion.div>

        {/* Share Feedback Collapsible Card */}
        <div style={{ marginBottom: '50px' }}>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              width: '100%',
              padding: '16px 25px',
              background: 'rgba(212, 164, 75, 0.08)',
              border: '1px dashed var(--primary)',
              color: 'var(--primary)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.3rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212, 164, 75, 0.08)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            <Star size={18} fill={showReviewForm ? 'currentColor' : 'none'} />
            {showReviewForm ? 'DISMISS FEEDBACK FORM' : 'SHARE YOUR GOURMET EXPERIENCE (WRITE A REVIEW)'}
          </button>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <form 
                  onSubmit={handleReviewSubmit}
                  style={{
                    background: 'rgba(18, 13, 11, 0.65)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    padding: '35px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Reviewer Name</label>
                      <input 
                        type="text" 
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                        style={formInputStyle}
                      />
                    </div>
                    
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Star Rating</label>
                      <div style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            size={28}
                            color="#D4A44B"
                            fill={star <= reviewRating ? '#D4A44B' : 'none'}
                            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={formLabelStyle}>Gourmet Experience Details</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe the signature flavors, wood smoke textures, and culinary plating standard..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      style={formTextareaStyle}
                    />
                  </div>

                  {/* Media Upload and Preview Block */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', alignItems: 'center' }}>
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Attach Gourmet Media (Image or Video)</label>
                      <div 
                        style={{
                          border: '1px dashed rgba(212, 164, 75, 0.3)',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'rgba(255, 255, 255, 0.02)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 164, 75, 0.3)'}
                      >
                        <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          Upload Image/Video (Max 5MB)
                        </span>
                        <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div>
                      {mediaFile ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          {mediaFileType === 'video' ? (
                            <video 
                              src={mediaFile} 
                              controls 
                              style={{
                                width: '220px',
                                height: '120px',
                                borderRadius: '4px',
                                border: '1px solid var(--primary)',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <img 
                              src={mediaFile} 
                              alt="Review preview" 
                              style={{
                                width: '220px',
                                height: '120px',
                                borderRadius: '4px',
                                border: '1px solid var(--primary)',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => { setMediaFile(null); setMediaFileType(null); }}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                          No attached media. Review will publish with standard avatar.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      padding: '16px',
                      background: 'var(--primary)',
                      color: '#000',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: '1px solid var(--primary)',
                      transition: 'all 0.3s ease',
                      marginTop: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#000';
                    }}
                  >
                    {isSubmittingReview ? 'SUBMITTING FEEDBACK...' : '✓ DEPLOY REVIEW TO CELLAR'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dashboard Statistics Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '50px'
        }}>
          <div style={statCardStyle}>
            <div style={iconBoxStyle}><ShoppingBag size={20} /></div>
            <div>
              <span style={statLabelStyle}>Total Bookings</span>
              <h4 style={statValueStyle}>{orders.length}</h4>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconBoxStyle}><Heart size={20} /></div>
            <div>
              <span style={statLabelStyle}>Total Expended</span>
              <h4 style={statValueStyle}>₹{totalSpent}</h4>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconBoxStyle}><Clock size={20} /></div>
            <div>
              <span style={statLabelStyle}>Active Orders</span>
              <h4 style={statValueStyle}>
                {orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'pending_verification' || o.status === 'ready').length}
              </h4>
            </div>
          </div>
        </div>

        {/* Order History Title */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-cormorant)', margin: 0 }}>
            BURGER <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>HISTORY</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {orders.length} orders registered
          </span>
        </div>

        {/* Order History Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.length === 0 ? (
            <div style={{
              background: 'rgba(18, 13, 11, 0.4)',
              border: '1px solid var(--border)',
              padding: '60px 40px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                You haven't ordered any premium burgers yet!
              </p>
              <Link href="/menu" className="btn-primary">
                ORDER YOUR FIRST BURGER
              </Link>
            </div>
          ) : (
            orders.map((order, idx) => (
              <motion.div
                key={order.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                style={{
                  background: 'rgba(18, 13, 11, 0.6)',
                  border: '1px solid var(--border)',
                  padding: '30px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  borderBottom: '1px solid rgba(212, 164, 75, 0.1)',
                  paddingBottom: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 10px',
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        borderRadius: '2px',
                        background: order.status === 'delivered' 
                          ? 'rgba(54, 179, 126, 0.1)' 
                          : order.status === 'ready' 
                            ? 'rgba(155, 89, 182, 0.15)' 
                            : 'rgba(212, 164, 75, 0.1)',
                        color: order.status === 'delivered' 
                          ? '#36b37e' 
                          : order.status === 'ready' 
                            ? '#9B59B6' 
                            : 'var(--primary)',
                        border: order.status === 'delivered' 
                          ? '1px solid rgba(54, 179, 126, 0.2)' 
                          : order.status === 'ready' 
                            ? '1px solid rgba(155, 89, 182, 0.3)' 
                            : '1px solid rgba(212, 164, 75, 0.2)'
                      }}>
                        {order.status === 'ready' ? 'Ready for Pickup 🔔' : (order.status || 'pending')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {order.order_id || 'n/a'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>
                      <Calendar size={14} />
                      <span>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      <span style={{ opacity: 0.3 }}>|</span>
                      <span>{new Date(order.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.15em', display: 'block', marginBottom: '5px' }}>
                      GRAND TOTAL
                    </span>
                    <span style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-cormorant)' }}>
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  {/* Items list */}
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {order.items && Array.isArray(order.items) && order.items.map((item: any, itemIdx: number) => (
                      <span key={itemIdx} style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.quantity}x</span> {item.name}
                      </span>
                    ))}
                  </div>

                  {/* Service option Summary */}
                  <div style={{ textAlign: 'right', maxWidth: '300px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--primary)', letterSpacing: '0.15em', display: 'block', marginBottom: '5px' }}>
                      SERVICE MODE
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', display: 'block', fontWeight: 600 }}>
                      {order.customer_address || 'Dine-In / Counter Collection'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

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
                The service bell is ringing! Our chefs have freshly prepared and completed your order (ID: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{readyOrder?.order_id}</strong>). Collect it now!
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
    </main>
  );
}

// Custom CSS styles
const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  textAlign: 'left'
};

const formLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--primary)'
};

const formInputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(212, 164, 75, 0.2)',
  borderRadius: '12px',
  padding: '14px 18px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease'
};

const formTextareaStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(212, 164, 75, 0.2)',
  borderRadius: '12px',
  padding: '14px 18px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  resize: 'none'
};

const statCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  padding: '25px',
  background: 'rgba(18, 13, 11, 0.5)',
  border: '1px solid var(--border)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
};

const iconBoxStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  border: '1px solid var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary)',
  borderRadius: '2px',
  background: 'rgba(212, 164, 75, 0.02)'
};

const statLabelStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '9px',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  display: 'block',
  marginBottom: '3px'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  color: '#fff',
  fontWeight: 800,
  margin: 0,
  lineHeight: 1
};
