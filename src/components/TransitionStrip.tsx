'use client';
import { motion } from 'framer-motion';
import styles from './TransitionStrip.module.css';

const features = [
  { id: 1, text: "ARTISAN BUNS", icon: "🥖" },
  { id: 3, text: "ORGANIC VEGGIES", icon: "🥬" },
  { id: 4, text: "SECRET SAUCE", icon: "🍯" },
  { id: 5, text: "HAND-CUT FRIES", icon: "🍟" },
];

const TransitionStrip = () => {
  return (
    <div className={styles.stripWrapper}>
      {/* Moving Marquee */}
      <div className={styles.marquee}>
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={styles.marqueeContent}
        >
          {[...features, ...features].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className={styles.featureItem}>
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.text}</span>
              <span className={styles.dot}>•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Overlay */}
      <div className={styles.overlay}></div>
    </div>
  );
};

export default TransitionStrip;
