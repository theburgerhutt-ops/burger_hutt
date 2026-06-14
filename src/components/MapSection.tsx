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
                  <p>Mukta Prasad, Bikaner, Rajasthan - 334004</p>
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
                  <p>+91 63671 12075<br />hello@burgerhut.com</p>
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
              src="https://maps.google.com/maps?q=Mukta%20Prasad%2C%20Bikaner%2C%20Rajasthan&t=&z=15&ie=UTF8&iwloc=&output=embed" 
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
