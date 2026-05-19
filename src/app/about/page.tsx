'use client';
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import PromotionBanner from "@/components/PromotionBanner";
import { Clock, Award, Users, Heart } from 'lucide-react';

const milestones = [
  { year: "2014", title: "The Humble Beginning", desc: "Started as a small food truck with a vision to serve the most gourmet burgers in the city." },
  { year: "2018", title: "First Flagship Outlet", desc: "Opened our first permanent location with a focus on cinematic dining experiences." },
  { year: "2021", title: "Culinary Innovation", desc: "Introduced our signature gold-leaf burgers and artisan brioche buns." },
  { year: "2024", title: "AI-Powered Dining", desc: "Integrated AI for personalized flavor analysis and seamless ordering." }
];

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

export default function AboutPage() {
  return (
    <main style={{ background: 'transparent', minHeight: '100vh', position: 'relative' }}>
      <Header />
      
      {/* Hero Section */}
      <section style={{ paddingTop: '180px', paddingBottom: '100px', position: 'relative', textAlign: 'center' }}>
        <div className="container">
          <motion.div {...floatingAnimation(5)}>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold uppercase tracking-[0.5em] text-[12px] mb-4 block"
            >
              Since 2014
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                fontFamily: 'var(--font-cormorant)', 
                fontSize: 'clamp(3rem, 8vw, 6rem)', 
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                lineHeight: 1
              }}
            >
              OUR <span style={{ color: '#fff', fontStyle: 'italic' }}>LEGACY</span>
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 150 }}
              style={{ height: '2px', background: 'var(--primary)', margin: '30px auto' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Story Content */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <motion.div
              {...floatingAnimation(6, 0.5)}
              style={{ position: 'relative' }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '-20px', 
                width: '100%', 
                height: '100%', 
                border: '1px solid var(--primary)', 
                zIndex: -1 
              }} />
              <img 
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800" 
                alt="Burger Making" 
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
              />
            </motion.div>

            <motion.div
              {...floatingAnimation(6, 1)}
            >
              <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', fontFamily: 'var(--font-cormorant)' }}>
                More Than Just A <span className="text-gold">Meal</span>
              </h2>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                At The Burger Hut, we believe that a burger is more than just ingredients between buns. It's a symphony of flavors, a result of meticulous craftsmanship, and a token of our love for gourmet dining.
              </p>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                Every sauce is whisked by hand, every bun is baked daily, and every patty is sourced from the finest cuts. We combine traditional techniques with modern technology to ensure every bite is perfection.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <motion.h2 {...floatingAnimation(5)} style={{ fontSize: '3rem', fontFamily: 'var(--font-cormorant)' }}>THE JOURNEY</motion.h2>
          </div>
          
          <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Timeline Line */}
            <div style={{ 
              position: 'absolute', 
              left: '50%', 
              top: 0, 
              bottom: 0, 
              width: '1px', 
              background: 'rgba(212, 164, 75, 0.2)',
              transform: 'translateX(-50%)'
            }} className="hidden md:block" />

            {milestones.map((m, i) => (
              <motion.div 
                key={i}
                {...floatingAnimation(7, i * 0.5)}
                style={{ 
                  display: 'flex', 
                  justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
                  marginBottom: '60px',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  width: '45%', 
                  background: 'var(--surface)', 
                  padding: '30px', 
                  border: '1px solid var(--border)',
                  textAlign: i % 2 === 0 ? 'right' : 'left',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span className="text-gold" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-cormorant)' }}>{m.year}</span>
                  <h4 style={{ margin: '10px 0', fontSize: '1.2rem', color: '#fff' }}>{m.title}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{m.desc}</p>
                </div>
                {/* Dot */}
                <div style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: '40px', 
                  width: '12px', 
                  height: '12px', 
                  background: 'var(--primary)', 
                  borderRadius: '50%', 
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 10px var(--primary)'
                }} className="hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {[
              { icon: Clock, val: "10+", label: "Years of Excellence" },
              { icon: Users, val: "50k+", label: "Happy Foodies" },
              { icon: Award, val: "15+", label: "Culinary Awards" },
              { icon: Heart, val: "100%", label: "Passion Guaranteed" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                {...floatingAnimation(5 + i, i * 0.3)}
                style={{ textAlign: 'center' }}
              >
                <stat.icon className="text-gold mb-4 mx-auto" size={40} />
                <h3 style={{ fontSize: '2.5rem' }}>{stat.val}</h3>
                <p className="text-muted uppercase tracking-widest text-[10px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PromotionBanner />
    </main>
  );
}
