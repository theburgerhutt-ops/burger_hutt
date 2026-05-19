'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { menuData, categories } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import styles from './MenuSection.module.css';

import Link from 'next/link';

interface MenuSectionProps {
  isFullPage?: boolean;
}

const MenuSection = ({ isFullPage = false }: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState('Regular');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredMenu = menuData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSubCategory = activeCategory !== 'Pizza' || item.subCategory === activeSubCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const displayedMenu = isFullPage ? filteredMenu : filteredMenu.slice(0, 6);

  return (
    <section className="section-padding" id="menu" style={{ background: 'transparent' }}>
      <div className="container">
        {!isFullPage && (
          <div className={styles.menuHeader}>
            <div className={styles.titleArea}>
              <div className={styles.accentLine} />
              <div>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className={styles.headerSubtitle}
                >
                  Gourmet Collection
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={styles.headerTitle}
                >
                  Chef's <span className="text-gold">Selection</span>
                </motion.h2>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={styles.headerActions}
            >
              <Link href="/menu" className={styles.exploreBtn}>
                EXPLORE FULL MENU
                <div className={styles.btnGlow} />
              </Link>
            </motion.div>
          </div>
        )}

        {isFullPage && (
          <div className={styles.fullPageControls}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search food..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.categoriesWrapper}>
              <button 
                className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                onClick={() => scrollCategories('left')}
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className={styles.categories} ref={categoriesRef}>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      if (cat === 'Pizza') setActiveSubCategory('Regular');
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button 
                className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                onClick={() => scrollCategories('right')}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {activeCategory === 'Pizza' && (
              <div className={styles.pizzaOptionsWrapper}>
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.subCategories}
                >
                  {['Regular', 'Medium', 'Large', 'Laziza (7")'].map(sub => (
                    <button 
                      key={sub}
                      className={`${styles.subCategoryBtn} ${activeSubCategory === sub ? styles.active : ''}`}
                      onClick={() => setActiveSubCategory(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.pizzaAddons}
                >
                  <div className={styles.addonItem}>
                    <span className={styles.addonLabel}>Extra Cheese</span>
                    <span className={styles.addonPrice}>+ ₹50</span>
                  </div>
                  <div className={styles.addonDivider}></div>
                  <div className={styles.addonItem}>
                    <span className={styles.addonLabel}>Cheese Burst</span>
                    <span className={styles.addonBadge}>Available</span>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className={styles.menuGrid}
        >
          <AnimatePresence mode='popLayout'>
            {displayedMenu.map((item) => (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.9 },
                  show: { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    transition: {
                      opacity: { duration: 0.5 },
                      scale: { type: "spring", stiffness: 100, damping: 15 },
                    }
                  }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                key={item.id} 
                className={styles.productCard}
              >
                <div className={styles.imageContainer}>
                  <img src={item.image} alt={item.name} />
                  {item.tags && item.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                  <div className={styles.isVegBadge}>
                    <span className={item.isVeg ? styles.veg : styles.nonVeg}>
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                </div>
                <div className={styles.details}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>{item.name}</h3>
                      {item.subCategory && item.category !== 'Pizza' && (
                        <span className={styles.subName}>{item.subCategory}</span>
                      )}
                    </div>
                    <div className={styles.rating}>
                      <Star size={14} fill="var(--primary)" color="var(--primary)" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className={styles.description}>{item.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{item.price}</span>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={styles.addToCartBtn} 
                      onClick={() => addToCart(item)}
                    >
                      ADD TO CART
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredMenu.length === 0 && (
          <div className={styles.noResults}>
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
