'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, User, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import styles from './Header.module.css';

import { supabase } from '@/lib/supabase';
import { getUser } from '@/app/actions/auth';

const Header = () => {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch current user including offline mock users
    getUser().then(currentUser => {
      setUser(currentUser);
    });

    // Fallback real-time event listener for actual Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
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
          <div className={styles.mobileMenu} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </div>

          <Link href="/" className={styles.logo}>
            THE <span className="text-gold">BURGER</span> HUT
          </Link>

          <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
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
