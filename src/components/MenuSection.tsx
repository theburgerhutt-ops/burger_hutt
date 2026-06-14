'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { menuData, categories, MenuItem } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import styles from './MenuSection.module.css';

import Link from 'next/link';

interface MenuSectionProps {
  isFullPage?: boolean;
}

interface GroupedMenuItem extends Omit<MenuItem, 'price'> {
  price?: number;
  variants?: {
    regular: MenuItem;
    withIceCream: MenuItem;
  };
}

const getGroupedItems = (items: MenuItem[]): GroupedMenuItem[] => {
  const result: GroupedMenuItem[] = [];
  const processedNatureCrafted = new Set<string>();

  items.forEach(item => {
    if (item.shakeType === 'Nature Crafted') {
      if (processedNatureCrafted.has(item.name)) {
        return;
      }
      processedNatureCrafted.add(item.name);
      
      const variants = items.filter(i => i.shakeType === 'Nature Crafted' && i.name === item.name);
      const regular = variants.find(v => v.subCategory === 'Regular') || item;
      const withIceCream = variants.find(v => v.subCategory === 'With Ice Cream') || item;
      
      result.push({
        ...regular,
        description: regular.description, // keep it clean
        variants: {
          regular,
          withIceCream
        }
      });
    } else {
      result.push({ ...item });
    }
  });

  return result;
};

const MenuSection = ({ isFullPage = false }: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState('Regular');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, activeOffer } = useCart();
  const categoriesRef = useRef<HTMLDivElement>(null);

  let isExpired = false;
  if (activeOffer && activeOffer.expiryDate) {
    const expiry = new Date(activeOffer.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    if (new Date() > expiry) isExpired = true;
  }
  const isOfferActive = activeOffer && activeOffer.active && activeOffer.discountPercentage > 0 && !isExpired;

  const renderPrice = (priceVal?: number) => {
    if (priceVal === undefined) return null;
    if (isOfferActive && activeOffer) {
      const discounted = Math.round(priceVal * (1 - activeOffer.discountPercentage / 100));
      return (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.6em', fontFamily: 'var(--font-inter)' }}>₹{priceVal}</span>
          <span style={{ color: '#D4A44B' }}>₹{discounted}</span>
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{ fontSize: '0.7em', color: 'var(--primary)' }}>₹</span>{priceVal}
      </span>
    );
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const groupedMenuData = getGroupedItems(menuData);

  const filteredMenu = groupedMenuData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    let matchesSubCategory = true;
    if (activeCategory === 'Pizza') {
      matchesSubCategory = item.subCategory === activeSubCategory;
    } else if (activeCategory === 'Shakes') {
      matchesSubCategory = item.shakeType === activeSubCategory;
    }
    
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
                      if (cat === 'Pizza') {
                        setActiveSubCategory('Regular');
                      } else if (cat === 'Shakes') {
                        setActiveSubCategory('Normal');
                      }
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
                    <span className={styles.addonPrice}>+ ₹79</span>
                  </div>
                </motion.div>
              </div>
            )}

            {activeCategory === 'Shakes' && (
              <div className={styles.pizzaOptionsWrapper}>
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.subCategories}
                >
                  {['Normal', 'Nature Crafted'].map(sub => (
                    <button 
                      key={sub}
                      className={`${styles.subCategoryBtn} ${activeSubCategory === sub ? styles.active : ''}`}
                      onClick={() => setActiveSubCategory(sub)}
                    >
                      {sub}
                    </button>
                  ))}
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
                className={`${styles.productCard} ${item.shakeType === 'Nature Crafted' ? styles.natureShakeCard : ''}`}
              >
                <div className={`${styles.imageContainer} ${item.shakeType === 'Nature Crafted' ? styles.natureShakeImageContainer : ''}`}>
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
                      {item.subCategory && item.category !== 'Pizza' && !item.variants && (
                        <span className={styles.subName}>{item.subCategory}</span>
                      )}
                    </div>
                    <div className={styles.rating}>
                      <Star size={14} fill="var(--primary)" color="var(--primary)" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className={styles.description}>{item.description}</p>
                  
                  {item.variants ? (
                    <div className={styles.variantsFooter}>
                      <div className={styles.variantCol}>
                        <span className={styles.variantLabel}>Regular</span>
                        <div className={styles.variantPriceAndAction}>
                          <span className={styles.variantPrice}>{renderPrice(item.variants.regular.price)}</span>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.variantAddBtn} 
                            onClick={() => addToCart(item.variants!.regular)}
                          >
                            + Add
                          </motion.button>
                        </div>
                      </div>
                      <div className={styles.variantDivider}></div>
                      <div className={styles.variantCol}>
                        <span className={styles.variantLabel}>With Ice Cream</span>
                        <div className={styles.variantPriceAndAction}>
                          <span className={styles.variantPrice}>{renderPrice(item.variants.withIceCream.price)}</span>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.variantAddBtn} 
                            onClick={() => addToCart(item.variants!.withIceCream)}
                          >
                            + Add
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>{renderPrice(item.price)}</span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={styles.addToCartBtn} 
                        onClick={() => addToCart(item as MenuItem)}
                      >
                        ADD TO CART
                      </motion.button>
                    </div>
                  )}
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
