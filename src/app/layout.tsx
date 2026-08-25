import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminNotificationProvider } from "@/context/AdminNotificationContext";
import { UserProfileProvider } from "@/context/UserProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S&S FASHION | Authentic Sneakers, Shoes & Slides",
  description:
    "Discover the latest sneakers, shoes, slides, and boots from top brands like Nike, Adidas, Puma, and more. Premium quality, authentic styles, and unbeatable comfort.",
  keywords: [
    "sneakers",
    "shoes",
    "slides",
    "boots",
    "Nike",
    "Adidas",
    "Puma",
    "Jordan",
    "New Balance",
    "Vans",
    "Converse",
    "sneaker store",
    "shoe store",
    "Ghana",
    "GHS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900`}
      >
        <CartProvider>
          <WishlistProvider>
            <AdminNotificationProvider>
              <UserProfileProvider>
                <Header />
                <main className="min-h-screen">{children}</main>
                <Footer />
              </UserProfileProvider>
            </AdminNotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}