'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    totalPrice, 
    originalPrice, 
    activeOffer, 
    totalItems,
    thresholdActive,
    thresholdMinAmount,
    thresholdDiscountPercentage
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.overlay}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={styles.drawer}
          >
            <div className={styles.header}>
              <div className={styles.titleArea}>
                <ShoppingBag size={24} className="text-gold" />
                <h3>Your Cart ({totalItems})</h3>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.itemsList}>
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <ShoppingBag size={64} className={styles.emptyIcon} />
                  <p>Your cart is empty.</p>
                  <button onClick={onClose} className="btn-primary">Browse Menu</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.name}</h4>
                      {item.subCategory && (
                        <span className={styles.itemSubCategory}>{item.subCategory}</span>
                      )}
                      <p className={styles.itemPrice}>₹{item.price}</p>
                      <div className={styles.quantityControls}>
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className={styles.footer}>
                {thresholdActive && originalPrice < thresholdMinAmount && (
                  <div style={{
                    background: 'rgba(212, 164, 75, 0.05)',
                    border: '1px dashed rgba(212, 164, 75, 0.3)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#D4A44B',
                    lineHeight: '1.4'
                  }}>
                    ✨ Add <strong style={{ color: '#fff' }}>₹{thresholdMinAmount - originalPrice}</strong> more to unlock <strong style={{ color: '#fff' }}>{thresholdDiscountPercentage}% OFF</strong> on your order!
                  </div>
                )}
                <div className={styles.summaryLine}>
                  <span>Subtotal</span>
                  <span style={{ textDecoration: activeOffer?.active ? 'line-through' : 'none', opacity: activeOffer?.active ? 0.6 : 1 }}>
                    ₹{originalPrice}
                  </span>
                </div>
                {activeOffer?.active && (
                  <div className={styles.summaryLine} style={{ color: '#D4A44B' }}>
                    <span>Offer ({activeOffer.discountPercentage}%)</span>
                    <span>-₹{originalPrice - totalPrice}</span>
                  </div>
                )}
                <div className={styles.summaryLine}>
                  <span>Delivery Fee</span>
                  <span className="text-gold">FREE</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.total}`}>
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <Link href="/checkout" onClick={onClose} className="w-full">
                  <button className={`btn-primary ${styles.checkoutBtn}`}>
                    Checkout
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
