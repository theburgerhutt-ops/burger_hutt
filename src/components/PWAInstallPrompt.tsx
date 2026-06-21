'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered successfully:', registration.scope);
          })
          .catch((err) => {
            console.error('SW registration failed:', err);
          });
      });
    }

    // 2. Listen for BeforeInstallPromptEvent
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Check if user has previously dismissed it in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setDeferredPrompt(null);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Dismiss for current session so it doesn't annoy the user
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '90%',
            maxWidth: '480px',
            background: 'rgba(15, 15, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 164, 75, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a44b, #aa7c2c)',
                boxShadow: '0 4px 10px rgba(212, 164, 75, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#000',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              BH
            </div>
            <div>
              <h4
                style={{
                  color: '#fff',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '0.03em',
                }}
              >
                The Burger Hut
              </h4>
              <p
                style={{
                  color: '#a3a3a3',
                  fontSize: '0.75rem',
                  margin: '2px 0 0 0',
                }}
              >
                Add to Home Screen for fast ordering & tracking
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                background: '#d4a44b',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 12px rgba(212, 164, 75, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5b65c';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#d4a44b';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Download size={14} /> Install
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#737373',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s, background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#737373';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
