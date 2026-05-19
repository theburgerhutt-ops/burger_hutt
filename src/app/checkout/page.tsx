'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, CreditCard, ShoppingBag, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './Checkout.module.css';
import { supabase } from '@/lib/supabase';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [diningOption, setDiningOption] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [paymentOption, setPaymentOption] = useState<'counter' | 'online'>('online');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tableNumber: '',
    pickupTime: 'As soon as possible (15-20 mins)',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || '',
        }));
      }
      setCheckingAuth(false);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File is too large. Please upload an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in your name and phone number');
      return;
    }

    if (!screenshot) {
      alert('Please click "SHOW UPI & QR DETAILS", scan the code to complete payment, and upload your screenshot proof to proceed.');
      setShowPaymentDetails(true);
      return;
    }

    setLoading(true);

    try {
      const generatedOrderId = 'ORD-BH-' + Math.floor(100000 + Math.random() * 900000);
      const addressString = diningOption === 'dine_in' 
        ? `Dine-In (Table: ${formData.tableNumber || 'Self-Select'})`
        : `Takeaway (Pickup Time: ${formData.pickupTime})`;

      // Save order to Supabase directly
      const saveResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: 'UPI_SCREENSHOT',
          orderId: generatedOrderId,
          signature: 'DIRECT_OFFLINE',
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: addressString,
          },
          items: cart,
          total: totalPrice,
          userId: user?.id,
          paymentMethod: 'Online UPI',
          screenshot: screenshot, // Pass base64 screenshot
        }),
      });

      if (saveResponse.ok) {
        const resData = await saveResponse.json();
        clearCart();
        window.location.href = `/order-success?id=${resData.order.id}`;
      } else {
        alert('Failed to save order. Please contact support.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.checkoutPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(212, 164, 75, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.checkoutPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(18, 13, 11, 0.7)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(15px)',
          padding: '50px 40px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '15px', left: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', top: '15px', right: '15px', width: '15px', height: '15px', borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '15px', height: '15px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />

          <ShieldAlert size={48} style={{ color: 'var(--primary)', marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }} />
          <span style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            — Fine Dining Access —
          </span>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', color: 'white', marginBottom: '15px' }}>
            MEMBERSHIP <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>REQUIRED</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '35px' }}>
            To complete your order at The Burger Hut, please sign in to your guest account or create a new membership.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link href="/login?redirect=/checkout" className="btn-primary" style={{ animation: 'none', display: 'block', textDecoration: 'none' }}>
              SIGN IN TO PROCEED
            </Link>
            <Link href="/signup?redirect=/checkout" style={{
              padding: '12px 30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.8rem',
              transition: 'all 0.3s ease',
              display: 'block',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            >
              CREATE MEMBERSHIP
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container text-center">
          <h2 className={styles.sectionTitle}>Your Cart is <span>Empty</span></h2>
          <Link href="/menu" className="btn-primary">Go to Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        <Link href="/menu" className="flex items-center gap-2 text-gold mb-10 hover:opacity-80" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to Menu
        </Link>

        <div className={styles.checkoutGrid}>
          {/* Checkout Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.formCard}
          >
            <h2 className={styles.sectionTitle}><User size={32} /> Dining <span>Details</span></h2>
            
            {/* Dining Options Selector Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '35px' }}>
              <button
                type="button"
                onClick={() => setDiningOption('dine_in')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: diningOption === 'dine_in' ? '1px solid var(--primary)' : '1px solid rgba(212, 164, 75, 0.15)',
                  background: diningOption === 'dine_in' ? 'var(--primary)' : 'rgba(18, 13, 11, 0.5)',
                  color: diningOption === 'dine_in' ? 'black' : '#F5E6C8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: diningOption === 'dine_in' ? '0 0 15px rgba(212, 164, 75, 0.3)' : 'none'
                }}
              >
                DINE-IN (EAT HERE)
              </button>
              
              <button
                type="button"
                onClick={() => setDiningOption('takeaway')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: diningOption === 'takeaway' ? '1px solid var(--primary)' : '1px solid rgba(212, 164, 75, 0.15)',
                  background: diningOption === 'takeaway' ? 'var(--primary)' : 'rgba(18, 13, 11, 0.5)',
                  color: diningOption === 'takeaway' ? 'black' : '#F5E6C8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: diningOption === 'takeaway' ? '0 0 15px rgba(212, 164, 75, 0.3)' : 'none'
                }}
              >
                TAKEAWAY (PARCEL)
              </button>
            </div>

            <form onSubmit={handleCheckout}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="name"
                    required
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="Enter 10-digit number" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              {diningOption === 'dine_in' ? (
                <div className={styles.formGroup}>
                  <label>Table Number (Optional)</label>
                  <input 
                    type="text" 
                    name="tableNumber"
                    placeholder="e.g. Table 4, Table 12" 
                    value={formData.tableNumber}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Preferred Pickup Time</label>
                  <select
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={(e: any) => setFormData({ ...formData, pickupTime: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(18, 13, 11, 0.5)',
                      border: '1px solid rgba(212, 164, 75, 0.2)',
                      padding: '16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      borderRadius: '0px'
                    }}
                  >
                    <option value="As soon as possible (15-20 mins)" style={{ background: '#120d0b', color: 'white' }}>As soon as possible (15-20 mins)</option>
                    <option value="In 30 minutes" style={{ background: '#120d0b', color: 'white' }}>In 30 minutes</option>
                    <option value="In 45 minutes" style={{ background: '#120d0b', color: 'white' }}>In 45 minutes</option>
                    <option value="In 1 hour" style={{ background: '#120d0b', color: 'white' }}>In 1 hour</option>
                  </select>
                </div>
              )}

              {/* Payment Mode Trigger */}
              <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4A44B', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                  Payment Method
                </label>
                <button
                  type="button"
                  onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: showPaymentDetails ? '1px solid var(--primary)' : '1px solid rgba(212, 164, 75, 0.3)',
                    background: showPaymentDetails ? 'rgba(212, 164, 75, 0.1)' : 'rgba(18, 13, 11, 0.4)',
                    color: showPaymentDetails ? 'var(--primary)' : '#F5E6C8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  <CreditCard size={16} />
                  {showPaymentDetails ? 'HIDE UPI & QR DETAILS' : 'SHOW UPI & QR DETAILS'}
                </button>
              </div>

              {/* Dynamic UPI QR Code and Screenshot Upload (Conditional on click) */}
              {showPaymentDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    border: '1px solid rgba(212, 164, 75, 0.2)',
                    background: 'rgba(18, 13, 11, 0.6)',
                    padding: '25px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: '#F5E6C8', marginBottom: '15px', lineHeight: 1.5 }}>
                    Scan the UPI QR Code to pay <strong>₹{totalPrice}</strong> and upload the payment screenshot below.
                  </p>
                  
                  {/* QR Code Container */}
                  <div style={{
                    width: '180px',
                    height: '180px',
                    background: 'white',
                    margin: '0 auto 20px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=burgerhut@upi%26pn=TheBurgerHut%26am=${totalPrice}%26cu=INR`} 
                      alt="UPI Payment QR Code" 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>
                    UPI ID: burgerhut@upi
                  </div>

                  <div className={styles.formGroup} style={{ textAlign: 'left', marginBottom: 0 }}>
                    <label>Upload Payment Screenshot</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={handleScreenshotChange}
                      style={{
                        padding: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(212, 164, 75, 0.3)',
                        color: '#F5E6C8',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    />
                    {screenshot && (
                      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#36B37E', fontWeight: 600 }}>✓ Screenshot uploaded</span>
                        <img src={screenshot} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--primary)' }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <p style={{
                fontSize: '10px',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginTop: '30px',
                fontWeight: 700,
                display: 'block'
              }}>
                ✓ Online Payment verification pending
              </p>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.summaryCard}
          >
            <div className={styles.summaryHeader}>
              <h3 className="flex items-center gap-3"><ShoppingBag size={24} /> Order Summary</h3>
            </div>

            <div className={styles.orderItems}>
              {cart.map(item => (
                <div key={item.id} className={styles.itemRow}>
                  <span className={styles.itemName}>{item.quantity}x {item.name}</span>
                  <span className={styles.itemTotal}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className={styles.totalsArea}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Dining Style</span>
                <span className="text-gold" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                  {diningOption === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span>Payment Mode</span>
                <span className="text-gold" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                  Online UPI
                </span>
              </div>
              <div className={styles.grandTotal}>
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>

              <button 
                className={styles.placeOrderBtn}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
