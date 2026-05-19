'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Play, X, ChevronRight, ChevronLeft, Image } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './ReviewsSection.module.css';
import { supabase } from '@/lib/supabase';

const fallbackReviews = [
  {
    id: 'f-1',
    name: "Arjun Sharma",
    role: "Food Blogger",
    content: "The best burger experience I've had in years. The smoke-infused patty is a game changer!",
    rating: 5,
    video: "https://assets.mixkit.co/videos/preview/mixkit-delicious-burger-and-fries-4630-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 'f-2',
    name: "Priya Patel",
    role: "Regular Guest",
    content: "Absolute luxury in every bite. The attention to detail in their presentation is unmatched.",
    rating: 5,
    video: "https://assets.mixkit.co/videos/preview/mixkit-man-eating-a-tasty-burger-8558-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 'f-3',
    name: "Rahul Verma",
    role: "Chef",
    content: "As a chef, I appreciate the quality of ingredients. The Hut Special is a masterpiece.",
    rating: 4
  },
  {
    id: 'f-4',
    name: "Sneha Reddy",
    role: "Designer",
    content: "Not just food, it's art. The atmosphere and the flavors are perfectly synchronized.",
    rating: 5,
    video: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-eating-a-large-burger-34446-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 'f-5',
    name: "Vikram Singh",
    role: "Entrepreneur",
    content: "Perfect spot for business meetings. Fast service and world-class gourmet burgers.",
    rating: 5
  },
  {
    id: 'f-6',
    name: "Ananya Iyer",
    role: "Vlogger",
    content: "The aesthetic here is just as good as the food. Highly recommended for dinner dates!",
    rating: 5,
    video: "https://assets.mixkit.co/videos/preview/mixkit-tasty-burger-on-a-wooden-tray-4632-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&q=80&w=400"
  }
];

const ReviewsSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadApprovedReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            role: "Verified Guest",
            content: r.text,
            rating: Math.floor(r.rating || 5),
            video: r.media_type === 'video' ? r.media_url : null,
            image: r.media_type === 'image' ? r.media_url : null
          }));
          setDbReviews(mapped);
        }
      } catch (err) {
        console.error("Error loading approved reviews:", err);
      }
    }
    loadApprovedReviews();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Combine database reviews and fallback default items
  const allReviews = dbReviews.length > 0 ? [...dbReviews, ...fallbackReviews] : fallbackReviews;

  return (
    <section className={styles.reviewsSection}>
      <div className="container">
        <div className={styles.header}>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-gold uppercase tracking-[0.4em] text-[10px] mb-4 block text-center"
          >
            Voice of our guests
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.title}
          >
            CUSTOMER <span className="text-gold">STORIES</span>
          </motion.h2>
        </div>

        <div className="relative group">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-black/50 border border-gold/30 p-3 rounded-full text-gold opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-black/50 border border-gold/30 p-3 rounded-full text-gold opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          >
            <ChevronRight size={24} />
          </button>

          <div className={styles.reviewsContainer} ref={scrollContainerRef}>
            {allReviews.map((review, idx) => (
              <motion.div
                key={review.id || idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ 
                  y: {
                    duration: 4 + (idx % 3),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className={styles.reviewCard}
              >
                <div className={styles.cardGlow} />
                <Quote className={styles.quoteIcon} size={24} />
                
                <div className={styles.stars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="var(--primary)" color="var(--primary)" />
                  ))}
                </div>

                {review.video && (
                  <div 
                    className={styles.videoPreview}
                    onClick={() => setSelectedVideo(review.video || null)}
                  >
                    <img src={review.thumbnail || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400"} alt={review.name} className={styles.videoThumbnail} />
                    <div className={styles.playOverlay}>
                      <div className={styles.playIcon}>
                        <Play size={24} fill="var(--primary)" />
                      </div>
                    </div>
                  </div>
                )}

                {review.image && (
                  <div 
                    className={styles.videoPreview}
                    onClick={() => setSelectedImage(review.image || null)}
                  >
                    <img src={review.image} alt={review.name} className={styles.videoThumbnail} />
                    <div className={styles.playOverlay}>
                      <div className={styles.playIcon} style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <Image size={24} color="var(--primary)" />
                      </div>
                    </div>
                  </div>
                )}

                <p className={styles.content}>{review.content}</p>

                <div className={styles.footer}>
                  <div className={styles.avatar}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={styles.name}>{review.name}</h4>
                    <span className={styles.role}>{review.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Lightbox */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
            >
              <button className={styles.closeModal} onClick={() => setSelectedVideo(null)}>
                CLOSE <X size={20} />
              </button>
              <video 
                src={selectedVideo} 
                className={styles.videoPlayer} 
                controls 
                autoPlay 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '80vw', maxHeight: '80vh' }}
            >
              <button className={styles.closeModal} onClick={() => setSelectedImage(null)}>
                CLOSE <X size={20} />
              </button>
              <img 
                src={selectedImage} 
                alt="Gourmet guest attachment detail"
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', borderRadius: '4px', objectFit: 'contain' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReviewsSection;
