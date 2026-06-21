import type { Metadata } from "next";
import { Cinzel, Poppins, Great_Vibes, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import GlobalBackground from "@/components/GlobalBackground";
import { CartProvider } from "@/context/CartContext";
import TopOfferBanner from "@/components/TopOfferBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const cinzel = Cinzel({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "The Burger Hut | Premium AI-Powered Cafe",
  description: "Experience the ultimate gourmet burger experience. AI-powered ordering, live tracking, and premium flavors at The Burger Hut.",
  keywords: ["burger", "cafe", "online ordering", "AI cafe", "The Burger Hut", "premium food"],
  authors: [{ name: "The Burger Hut Team" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "The Burger Hut | Premium AI-Powered Cafe",
    description: "Gourmet burgers and premium cafe experience with AI-powered ordering.",
    type: "website",
    url: "https://theburgerhut.com",
    images: [{ url: "/og-image.jpg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cinzel.variable} ${poppins.variable} ${script.variable} ${cormorant.variable} ${playfair.variable}`}>
      <body className={poppins.className} suppressHydrationWarning>
        <GlobalBackground />
        <CartProvider>
          <TopOfferBanner />
          {children}
          <Chatbot />
          <PWAInstallPrompt />
        </CartProvider>
      </body>
    </html>
  );
}
