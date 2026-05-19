'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, User, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import styles from './Header.module.css';

import { supabase } from '@/lib/supabase';

const Header = () => {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch current session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Add real-time event listener to update user state dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.mobileMenu}>
            <Menu size={24} />
          </div>

          <Link href="/" className={styles.logo}>
            THE <span className="text-gold">BURGER</span> HUT
          </Link>

          <nav className={styles.nav}>
            <Link href="/">Home</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <Search size={20} />
            </button>
            
            {/* Dynamic Auth Profile Button */}
            <Link 
              href={user ? "/profile" : "/login"} 
              className={styles.actionBtn}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <User size={20} style={user ? { color: 'var(--primary)' } : {}} />
              {user && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 5px var(--primary)'
                }} />
              )}
            </Link>

            <button 
              className={`${styles.actionBtn} ${styles.cartBtn}`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
