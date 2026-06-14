'use client';
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import PromotionBanner from "@/components/PromotionBanner";
import { MapPin, Phone, Mail, Send, MessageSquare } from 'lucide-react';

const floatingAnimation = (duration = 4, delay = 0) => ({
  animate: {
    y: [0, -15, 0],
  },
  transition: {
    duration: duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: delay
  }
});

export default function ContactPage() {
  return (
    <main style={{ background: 'transparent', minHeight: '100vh', position: 'relative' }}>
      <Header />
      
      {/* Hero Section */}
      <section style={{ paddingTop: '180px', paddingBottom: '60px', textAlign: 'center' }}>
        <div className="container">
          <motion.div {...floatingAnimation(5)}>
            <span className="text-gold uppercase tracking-[0.5em] text-[12px] mb-4 block">— Reach Out —</span>
            <h1 style={{ 
              fontFamily: 'var(--font-cormorant)', 
              fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              GET IN <span style={{ color: '#fff', fontStyle: 'italic' }}>TOUCH</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-padding" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
            
            {/* Form Side */}
            <motion.div {...floatingAnimation(6, 0.2)}>
              <div style={{ 
                background: 'var(--surface)', 
                padding: '50px', 
                border: '1px solid var(--border)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', fontFamily: 'var(--font-cormorant)' }}>Send Us A Message</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <input type="text" placeholder="YOUR NAME" style={inputStyle} />
                    <input type="email" placeholder="EMAIL ADDRESS" style={inputStyle} />
                  </div>
                  <input type="text" placeholder="SUBJECT" style={inputStyle} />
                  <textarea placeholder="YOUR MESSAGE" rows={5} style={inputStyle}></textarea>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'var(--primary)',
                      color: 'black',
                      padding: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '10px'
                    }}
                  >
                    SEND MESSAGE <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Info Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <motion.div {...floatingAnimation(5.5, 0.4)} style={infoCardStyle}>
                <div style={iconBoxStyle}><MapPin size={24} /></div>
                <div>
                  <h4 style={infoTitleStyle}>Our Location</h4>
                  <p style={infoTextStyle}>Mukta Prasad, Bikaner, Rajasthan - 334004</p>
                </div>
              </motion.div>

              <motion.div {...floatingAnimation(5.5, 0.6)} style={infoCardStyle}>
                <div style={iconBoxStyle}><Phone size={24} /></div>
                <div>
                  <h4 style={infoTitleStyle}>Call Us</h4>
                  <p style={infoTextStyle}>+91 63671 12075</p>
                </div>
              </motion.div>

              <motion.div {...floatingAnimation(5.5, 0.8)} style={infoCardStyle}>
                <div style={iconBoxStyle}><Mail size={24} /></div>
                <div>
                  <h4 style={infoTitleStyle}>Email Us</h4>
                  <p style={infoTextStyle}>hello@burgerhut.com</p>
                </div>
              </motion.div>

              {/* Instagram Social Box */}
              <motion.div {...floatingAnimation(6, 1)} style={{
                background: 'linear-gradient(45deg, rgba(212, 164, 75, 0.1), transparent)',
                padding: '40px',
                border: '1px solid var(--primary)',
                textAlign: 'center',
                marginTop: '10px'
              }}>
                <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <h4 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', marginBottom: '10px' }}>Follow The Journey</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Join our community for exclusive updates.</p>
                <a href="#" className="text-gold" style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem' }}>@THEBURGERHUT</a>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <PromotionBanner />
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(212, 164, 75, 0.2)',
  padding: '15px 20px',
  color: 'white',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%'
};

const infoCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  padding: '30px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  backdropFilter: 'blur(10px)'
};

const iconBoxStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  border: '1px solid var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary)',
  flexShrink: 0
};

const infoTitleStyle: React.CSSProperties = {
  color: 'var(--primary)',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  marginBottom: '5px'
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: 'white',
  opacity: 0.9
};
