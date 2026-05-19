'use client';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import styles from './MapSection.module.css';

const MapSection = () => {
  return (
    <section className={styles.mapSection}>
      <div className="container">
        <div className={styles.grid}>
          {/* Contact Information Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.infoCard}
          >
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] mb-4 block">Find Us</span>
            <h2 className={styles.title}>VISIT THE <span className="text-gold">HUT</span></h2>
            
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4>Our Location</h4>
                  <p>123 Gourmet Street, Foodie Valley, New Delhi - 110001</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4>Opening Hours</h4>
                  <p>Mon - Sun: 11:00 AM - 11:00 PM</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4>Contact Info</h4>
                  <p>+91 98765 43210<br />hello@burgerhut.com</p>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.directionBtn}
            >
              <Navigation size={18} />
              GET DIRECTIONS
            </motion.button>
          </motion.div>

          {/* Cinematic Map Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className={styles.mapContainer}
          >
            <div className={styles.mapOverlay} />
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.123456789!2d77.123456789!3d28.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzM0LjUiTiA3N8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              className={styles.iframe}
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
