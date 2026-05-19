'use client';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TransitionStrip from "@/components/TransitionStrip";
import StorySection from "@/components/StorySection";
import MenuSection from "@/components/MenuSection";
import ReviewsSection from "@/components/ReviewsSection";
import MapSection from "@/components/MapSection";
import ContactSection from "@/components/ContactSection";
import PromotionBanner from "@/components/PromotionBanner";
import SpecialOffers from "@/components/SpecialOffers";

export default function Home() {
  return (
    <main>
      <Header />
      {/* <SpecialOffers /> */}
      <Hero />
      <TransitionStrip />
      <StorySection />
      <MenuSection />
      <ReviewsSection />
      <MapSection />
      <ContactSection />
      <PromotionBanner />
    </main>
  );
}
