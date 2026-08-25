"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnnouncementBar } from "./AnnouncementBar";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { SearchBar } from "./SearchBar";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { CartDrawer } from "./CartDrawer";
import { useUserProfile } from "@/context/UserProfileContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?gender=Men" },
  { label: "Women", href: "/shop?gender=Women" },
  { label: "Kids", href: "/shop?gender=Kids" },
  { label: "Brands", href: "/shop?view=brands" },
  { label: "Sale", href: "/shop?sale=true" },
];

const helpItems = [
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Track Order", href: "/track-order" },
];

const companyItems = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function AccountLink() {
  const { profile } = useUserProfile();
  const isLoggedIn = !!profile.email || !!profile.firstName;

  return (
    <Link
      href={isLoggedIn ? "/account" : "/sign-in"}
      className="p-2 text-brand-black hover:text-brand-gold hover:bg-neutral-100 rounded-xl transition-colors"
      aria-label={isLoggedIn ? "My account" : "Sign in"}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </Link>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white transition-all duration-300",
        isScrolled && "shadow-sm border-b border-neutral-100"
      )}
    >
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-brand-black hover:text-brand-gold hover:bg-neutral-100 rounded-xl transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 lg:flex-shrink-0">
              <Logo size="lg" />
            </div>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:block flex-1 flex justify-center">
              <Navigation />
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Search - Desktop only, hidden on mobile */}
              <div className="hidden lg:block w-40">
                <SearchBar />
              </div>

              <WishlistIcon />
              <CartIcon
                asButton
                onClick={() => setIsCartOpen(true)}
              />
              {/* Account/Profile */}
              <AccountLink />
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 space-y-6">
              {/* Search in Mobile Menu */}
              <SearchBar className="mb-4" />

              {/* Main Navigation Links */}
              <nav className="space-y-2" aria-label="Mobile navigation">
                {navItems.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 text-brand-black hover:text-brand-gold hover:bg-neutral-50 rounded-xl transition-colors font-medium text-base",
                      item.label === "Sale" && "text-brand-red font-semibold"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                    {item.label === "Sale" && (
                      <span className="ml-2 text-xs font-bold bg-brand-red text-white px-2 rounded">HOT</span>
                    )}
                  </a>
                ))}
              </nav>

              {/* Help Dropdown - Mobile */}
              <div className="border-t border-neutral-200 pt-4">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-brand-black hover:text-brand-gold transition-colors font-medium text-base"
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === "help" ? null : "help")}
                  aria-expanded={openMobileDropdown === "help"}
                >
                  <span>Help</span>
                  <svg
                    className={cn("h-5 w-5 transition-transform", openMobileDropdown === "help" && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === "help" && (
                  <div className="mt-2 space-y-1 animate-in fade-in-0 duration-200">
                    {helpItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-8 py-2 text-sm text-neutral-600 hover:text-brand-gold hover:bg-neutral-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Dropdown - Mobile */}
              <div>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-brand-black hover:text-brand-gold transition-colors font-medium text-base"
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === "company" ? null : "company")}
                  aria-expanded={openMobileDropdown === "company"}
                >
                  <span>Company</span>
                  <svg
                    className={cn("h-5 w-5 transition-transform", openMobileDropdown === "company" && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === "company" && (
                  <div className="mt-2 space-y-1 animate-in fade-in-0 duration-200">
                    {companyItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-8 py-2 text-sm text-neutral-600 hover:text-brand-gold hover:bg-neutral-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile backdrop */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30 animate-in fade-in-0 duration-300"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}