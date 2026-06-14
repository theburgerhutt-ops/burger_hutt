'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from 'lucide-react';
import { io } from 'socket.io-client';

export default function TopOfferBanner() {
  const [offer, setOffer] = useState({ title: '', discountPercentage: 0, active: false, expiryDate: '' });

  useEffect(() => {
    // Initial fetch
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => setOffer(data))
      .catch(err => console.error("Failed to fetch offer", err));

    // Listen to real-time updates
    const socket = io();
    socket.on('offer-updated', (updatedOffer: any) => {
      setOffer(updatedOffer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  let isExpired = false;
  if (offer.expiryDate) {
    const expiry = new Date(offer.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    if (new Date() > expiry) isExpired = true;
  }

  return (
    <AnimatePresence>
      {offer.active && !isExpired && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{
            background: 'linear-gradient(90deg, #D4A44B 0%, #F3E5AB 50%, #D4A44B 100%)',
            color: '#1A1A1A',
            textAlign: 'center',
            padding: '8px 20px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(212, 164, 75, 0.4)',
            position: 'relative',
            zIndex: 1000
          }}
        >
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Tag size={16} color="#1A1A1A" style={{ flexShrink: 0 }} />
          </motion.div>
          <span style={{ display: 'inline-block', lineHeight: '1.2' }}>
            {offer.title} - <span style={{ color: '#D32F2F', fontWeight: 900 }}>{offer.discountPercentage}% OFF</span> APPLIED TO ALL ORDERS!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
