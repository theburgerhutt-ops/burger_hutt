'use client';
import { motion } from 'framer-motion';
import { Truck, Smartphone } from 'lucide-react';
import styles from './PromotionBanner.module.css';

const PromotionBanner = () => {
  return (
    <div className={styles.bannerWrapper}>
      <div className="container">
        <div className={styles.bannerContent}>
          {/* Delivery Info */}
          <div className={styles.item}>
            <Truck className="text-gold" size={24} />
            <div className={styles.textGroup}>
              <span className={styles.label}>FREE HOME DELIVERY</span>
              <span className={styles.value}>ABOVE ₹300</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.item}>
            <div className={styles.textGroup}>
              <span className={styles.label}>ORDER ON CALL</span>
              <span className={styles.value}>+91 63671 12075</span>
              <span className={styles.value}>+91 87654 32109</span>
            </div>
          </div>

          {/* Opening Info */}
          <div className={styles.item}>
            <div className={styles.textGroup}>
              <span className={styles.label}>STORE HOURS</span>
              <span className={styles.value}>OPEN TILL MIDNIGHT</span>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.socialGroup}>
            <span className={styles.followText}>Available on:</span>
            <div className={styles.icons}>
              <span className={styles.platform}>Zomato</span>
              <span className={styles.platform}>Swiggy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;
