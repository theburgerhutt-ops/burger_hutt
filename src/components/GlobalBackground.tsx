'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './GlobalBackground.module.css';

const GlobalBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={styles.backgroundWrapper}>
      {/* Global Scroll Progress Bar */}
      <motion.div 
        style={{ 
          scaleX, 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '4px', 
          background: 'var(--primary)', 
          transformOrigin: '0%', 
          zIndex: 9999 
        }} 
      />

      {/* Animated Image Layer */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          x: [-5, 5, -5],
          y: [-5, 5, -5]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className={styles.backgroundImage}
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      
      {/* Dark Overlays */}
      <div className={styles.overlay}></div>
      <div className={styles.texture}></div>

      {/* Floating Gold Embers (Global) */}
      <div className={styles.particleContainer}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-20, -300], 
              x: [0, (i % 2 === 0 ? 40 : -40)], 
              opacity: [0, 0.4, 0],
              scale: [1, 1.5]
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.8 
            }}
            className={styles.goldEmbers}
            style={{ left: `${(i * 7) % 100}%` }}
          />
        ))}
      </div>

      {/* Gold Cursor Glow (Global) */}
      <motion.div 
        animate={{ x: mousePos.x - 100, y: mousePos.y - 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
        className={styles.cursorGlow}
      />
    </div>
  );
};

export default GlobalBackground;
