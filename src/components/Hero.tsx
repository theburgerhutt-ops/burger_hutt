'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      {/* Background is now global, Hero is transparent */}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: 1, 
          y: [0, -15, 0], /* Continuous Floating/Breathing */
        }}
        transition={{ 
          opacity: { duration: 1 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className={styles.brandingWrapper}
      >
        <span className={styles.preTitle}>THE</span>
        <h1 className={styles.mainTitle}>BURGER <span className="text-gold">HUT</span></h1>
        
        <div className={styles.quoteWrapper}>
          <span className={styles.goldDot}></span>
          <p className={styles.quote}>Good Food, Good Mood</p>
          <span className={styles.goldDot}></span>
        </div>

        <div className={styles.ctaGroup}>
          <Link href="/menu">
            <button className={styles.btnGold}>VIEW MENU</button>
          </Link>
          <Link href="/menu">
            <button className={styles.btnOutline}>ORDER NOW</button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
