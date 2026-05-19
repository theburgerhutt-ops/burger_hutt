'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './StorySection.module.css';

const StorySection = () => {
  return (
    <section className={styles.storySection} id="story">
      <div className="container">
        <div className={styles.grid}>
          {/* Visual Side: Collage Design */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={styles.collageWrapper}
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className={styles.mainImageFrame}
            >
              <img 
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800" 
                alt="The Burger Hut Interior" 
                className={styles.mainImage}
              />
              <div className={styles.imageOverlay}></div>
            </motion.div>
            
            {/* Decorative Floating Elements */}
            <div className={styles.leaf1}>🌿</div>
            <div className={styles.pepper1}>🌶️</div>
          </motion.div>


          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={styles.content}
          >
            <div className={styles.sectionHeader}>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={styles.subTitle}
              >
                Est. 2014
              </motion.span>
              <motion.h2 
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className={styles.title}
              >
                The Heart of <br/> <span className="text-gold">Culinary Art</span>
              </motion.h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                transition={{ duration: 1, delay: 0.8 }}
                className={styles.titleUnderline}
              ></motion.div>
            </div>

            <div className={styles.storyText}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={styles.quoteBox}
              >
                <span className={styles.quoteIcon}>“</span>
                <p className={styles.lead}>
                  Redefining the very essence of the gourmet experience.
                </p>
              </motion.div>
              <div className={styles.divider}></div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                Founded on uncompromising quality, The Burger Hut merges artisan craftsmanship with AI-driven flavor analysis. Every bite is a legacy of passion, served on a toasted brioche bun.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className={styles.signature}
            >
              <span className={styles.sigName}>Shivanshu Kushwah</span>
              <span className={styles.sigTitle}>Founder & Executive Chef</span>
            </motion.div>

            <Link href="/about">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Our Full Journey
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Background Decorative Text */}
      <div className={styles.bgText}>CRAFTING PERFECTION</div>
    </section>
  );
};

export default StorySection;
