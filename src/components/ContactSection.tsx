'use client';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import styles from './ContactSection.module.css';

const ContactSection = () => {
  return (
    <section className={styles.contactSection}>
      <div className="container">
        <div className={styles.grid}>
          {/* Social Media Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.socialCard}
          >
            <div className={styles.instaIcon}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <span className="text-gold uppercase tracking-[0.5em] text-[10px] mb-4 block">— Instagram —</span>
            <h2 className={styles.title}>JOIN THE <span className="text-gold">TRIBE</span></h2>
            <p className={styles.subtitle}>Get a glimpse behind the grill and stay updated with our latest creations.</p>
            
            <motion.a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.instaBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              FOLLOW US <ArrowRight size={18} />
            </motion.a>
          </motion.div>

          {/* Quick Contact Info */}
          <div className={styles.contactInfo}>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={styles.infoItem}
            >
              <div className={styles.iconBox}>
                <Phone size={24} />
              </div>
              <div className={styles.infoText}>
                <h4>Reservation Line</h4>
                <p>+91 98765 43210</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={styles.infoItem}
            >
              <div className={styles.iconBox}>
                <MessageCircle size={24} />
              </div>
              <div className={styles.infoText}>
                <h4>WhatsApp Us</h4>
                <p>+91 98765 43210</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={styles.infoItem}
            >
              <div className={styles.iconBox}>
                <Mail size={24} />
              </div>
              <div className={styles.infoText}>
                <h4>General Inquiry</h4>
                <p>hello@burgerhut.com</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
