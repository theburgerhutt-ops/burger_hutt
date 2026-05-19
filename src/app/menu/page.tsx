'use client';
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import PromotionBanner from "@/components/PromotionBanner";
import { motion } from "framer-motion";

export default function FullMenuPage() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <Header />
      
      {/* 
        We are using the GlobalBackground from layout.tsx 
        to keep it consistent with the home page.
      */}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Cinematic Parallax Gallery - Fine-tuned Position */}
        <div className="hidden lg:block" style={{ 
          position: 'absolute', 
          top: '60px', 
          right: '50px', 
          width: '550px', 
          height: '420px',
          zIndex: 5
        }}>
          {/* Image 1 - Top Left */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [-5, -8, -5]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '60px',
              width: '180px',
              height: '240px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(212, 164, 75, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 3
            }}
          >
            <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400" alt="Burger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
          </motion.div>

          {/* Image 2 - Main Center */}
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [5, 2, 5]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              position: 'absolute',
              top: '80px',
              right: '40px',
              width: '200px',
              height: '280px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(212, 164, 75, 0.3)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.7)',
              zIndex: 2
            }}
          >
            <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" alt="Shake" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
          </motion.div>

          {/* Image 3 - Bottom Left (Raised) */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-2, -5, -2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '50px',
              left: '120px',
              width: '160px',
              height: '220px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(212, 164, 75, 0.2)',
              boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
              zIndex: 4
            }}
          >
            <img src="https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400" alt="Drink" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
          </motion.div>
        </div>

        {/* Page Header */}
        <section style={{ paddingTop: '180px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ position: 'relative' }}>
            
            {/* Left Side Aesthetic Elements */}
            <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '600px', height: '600px', pointerEvents: 'none', zIndex: -1 }}>
              {/* Background Glow */}
              <div style={{ 
                position: 'absolute', 
                top: '20%', 
                left: '10%', 
                width: '400px', 
                height: '400px', 
                background: 'radial-gradient(circle, rgba(212, 164, 75, 0.08) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }} />

              {/* Floating Leaf 1 */}
              <motion.img 
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src="https://www.pngall.com/wp-content/uploads/5/Leaf-PNG-Free-Download.png" 
                style={{ position: 'absolute', top: '150px', left: '0', width: '100px', opacity: 0.3, filter: 'blur(2px) sepia(1) saturate(2)' }}
              />

              {/* Floating Onion Ring */}
              <motion.img 
                animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                src="https://www.pngall.com/wp-content/uploads/5/Onion-Ring-PNG-Free-Download.png" 
                style={{ position: 'absolute', bottom: '150px', left: '100px', width: '80px', opacity: 0.2, filter: 'blur(1px) brightness(0.7)' }}
              />
            </div>

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ maxWidth: '600px', position: 'relative' }}
            >
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-gold uppercase tracking-[0.5em] text-[11px] mb-5 block"
                style={{ fontWeight: 600 }}
              >
                — Experience Excellence
              </motion.span>
              
              <div style={{ position: 'relative' }}>
                <motion.h1 
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-8xl mb-4"
                  style={{ 
                    fontFamily: 'var(--font-cormorant)', 
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    textAlign: 'left',
                    lineHeight: 0.9
                  }}
                >
                  OUR FULL <br />
                  <span style={{ 
                    color: '#fff', 
                    fontStyle: 'italic', 
                    display: 'block', 
                    marginTop: '10px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)' 
                  }}>MENU</span>
                </motion.h1>

                {/* Decorative Line */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  style={{ 
                    width: '100px', 
                    height: '2px', 
                    background: 'var(--primary)', 
                    margin: '30px 0',
                    transformOrigin: 'left'
                  }} 
                />
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-muted text-lg"
                style={{ 
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic', 
                  opacity: 0.5, 
                  textAlign: 'left', 
                  maxWidth: '450px',
                  lineHeight: 1.4
                }}
              >
                "A carefully curated journey through the art of gourmet dining, where every dish tells a story of passion and flavor."
              </motion.p>
            </motion.div>
          </div>
        </section>

        <div style={{ position: 'relative', zIndex: 30 }}>
          <MenuSection isFullPage={true} />
        </div>
        
        <div style={{ marginTop: '80px' }}>
          <PromotionBanner />
        </div>
      </div>
    </main>
  );
}
