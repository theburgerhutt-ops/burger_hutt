'use client';
import { motion } from 'framer-motion';
import { Gift, Zap } from 'lucide-react';
import styles from './SpecialOffers.module.css';

const floatingAnimation = (duration = 4, delay = 0) => ({
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: delay
  }
});

const SpecialOffers = () => {
  return (
    <section className={styles.offersSection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={styles.subTitle}
          >
            Limited Time
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={styles.title}
          >
            EXCLUSIVE <span className="text-gold">OFFERS</span>
          </motion.h2>
        </div>

        <div className={styles.grid}>
          {/* Main BOGO Offer */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            {...floatingAnimation(5)}
            className={styles.mainOfferCard}
          >
            <div className={styles.offerBadge}>EVERY MON & TUE</div>
            <div className={styles.iconBox}>
              <Gift size={40} className="text-gold" />
            </div>
            <div className={styles.offerContent}>
              <h3>BUY 1 GET 1 <span className="text-gold">FREE</span></h3>
              <p>On all Medium or Large Pizzas</p>
              <div className={styles.terms}>*Valid on Dine-in & Takeaway</div>
            </div>
            <div className={styles.cardGlow}></div>
          </motion.div>

          {/* Weekend Bonanza */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            {...floatingAnimation(6, 0.5)}
            className={styles.secondaryOfferCard}
          >
            <div className={styles.offerBadge}>WEEKEND BONANZA</div>
            <div className={styles.iconBox}>
              <Zap size={30} className="text-gold" />
            </div>
            <div className={styles.offerContent}>
              <h4>2 SHAKES + <span className="text-gold">20% OFF</span></h4>
              <p>On Any Pizza</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
