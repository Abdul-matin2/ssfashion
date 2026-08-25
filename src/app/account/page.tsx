"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWishlist, WishlistItemWithDetails } from "@/context/WishlistContext";
import { useCart, CartItemWithDetails } from "@/context/CartContext";
import { useUserProfile } from "@/context/UserProfileContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Product, Brand, Category, Gender } from "@/types/product";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth";

type Tab = "overview" | "orders" | "wishlist" | "settings" | "notifications";

// Notification bell with dropdown - defined outside to avoid recreation on render
function NotificationBell({
  notifications,
  notificationsLoading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>;
  notificationsLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center p-2 text-brand-black hover:text-brand-gold transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold text-brand-white bg-brand-red rounded-full"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-brand-black">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-medium text-brand-gold hover:text-brand-accent-hover transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificationsLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-neutral-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                      <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">
                No new notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer",
                    !notification.read && "bg-brand-gold/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
                    )}
                    <div className={cn("min-w-0", notification.read && "pl-[18px]")}>
                      <p className={cn("text-sm truncate", !notification.read ? "font-semibold text-brand-black" : "font-medium text-neutral-700")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {notification.message} · {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CustomerNotification {
  id: string;
  email: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId: string | null;
  createdAt: string;
}

interface CustomerOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  itemsDetail: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image: string;
  }>;
  shipping: {
    address: string;
    city: string;
    region: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  createdAt: string;
}

interface Notification {
  id: string;
  email: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId: string | null;
  createdAt: string;
}

const STATUS_NOTIFICATIONS: Record<string, { title: string; message: string }> = {
  processing: {
    title: "Order is being processed",
    message: "Your order is now being prepared for shipment.",
  },
  shipped: {
    title: "Order shipped!",
    message: "Your order has been shipped and is on its way to you.",
  },
  delivered: {
    title: "Order delivered",
    message: "Your order has been delivered. Enjoy your purchase!",
  },
  cancelled: {
    title: "Order cancelled",
    message: "Your order has been cancelled. Contact support for details.",
  },
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  momo: "Mobile Money",
  card: "Card Payment",
};

export default function AccountPage() {
  const router = useRouter();
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist();
  const { items: cartItems, getTotalItems } = useCart();
  const { profile, updateProfile, clearProfile, deleteAccount } = useUserProfile();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    const result = await updateProfile(profile);
    if (result.error) {
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Check if user is logged in (has profile data)
  useEffect(() => {
    if (isClient && !profile.email && !profile.firstName) {
      router.push("/sign-in");
    }
  }, [isClient, profile, router]);

  // Fetch orders from API
  useEffect(() => {
    if (!profile.email) return;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(profile.email)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [profile.email]);

  // Fetch notifications from API
  useEffect(() => {
    if (!profile.email) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/customer/notifications?email=${encodeURIComponent(profile.email)}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setNotificationsLoading(false);
      }
    };
    fetchNotifications();
  }, [profile.email]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (!profile.email) return;
    try {
      await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, markAll: true }),
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    // Update local state immediately for responsive UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Persist to server
    if (!profile.email) return;
    try {
      await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email: profile.email }),
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-brand-gold">Loading account...</div>
      </div>
    );
  }

  // Check if profile is incomplete (missing phone, country, or region)
  const isProfileIncomplete = !profile.phone || !profile.country || !profile.region;

  // Wishlist items already carry full product details (stored at add time)
  const wishlistProducts: Product[] = wishlistItems.map((item) => ({
    id: item.productId,
    name: item.name,
    brand: item.brand as Brand,
    category: item.category as Category,
    gender: "Unisex" as Gender,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    images: [item.image],
    sizes: [],
    colors: item.colors,
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isNew: false,
    slug: item.slug,
    description: "",
    shortDescription: "",
    tags: [],
  }));

  const totalCartItems = getTotalItems();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "orders", label: "Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { id: "wishlist", label: "Wishlist", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { id: "notifications", label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white transition-colors"
                aria-label="Toggle navigation menu"
              >
                <svg className="h-6 w-6 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-brand-black mb-2">My Account</h1>
                <p className="text-neutral-600">Manage your orders, wishlist, and account settings.</p>
              </div>
            </div>
            <NotificationBell
              notifications={notifications}
              notificationsLoading={notificationsLoading}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </div>
        </div>

        {/* Incomplete Profile Banner */}
        {isProfileIncomplete && (
          <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-brand-black">Complete your profile</p>
                <p className="text-xs text-neutral-600">Add phone, country, and region for faster checkout and order updates.</p>
              </div>
            </div>
            <Link
              href="/complete-profile"
              className="text-sm font-medium text-brand-gold hover:text-brand-accent-hover whitespace-nowrap"
            >
              Complete Profile →
            </Link>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mb-6">
            <nav className="bg-white border border-neutral-200 rounded-2xl p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-black text-brand-white"
                      : "text-brand-black hover:bg-neutral-50"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${activeTab === tab.id ? "text-brand-gold" : "text-neutral-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                  {tab.id === "wishlist" && wishlistProducts.length > 0 && (
                    <span className="ml-auto text-xs bg-brand-red text-white px-2 py-0.5 rounded-full">
                      {wishlistProducts.length}
                    </span>
                  )}
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-brand-gold text-white px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-black text-brand-white"
                      : "text-brand-black hover:bg-white"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${activeTab === tab.id ? "text-brand-gold" : "text-neutral-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                  {tab.id === "wishlist" && wishlistProducts.length > 0 && (
                    <span className="ml-auto text-xs bg-brand-red text-white px-2 py-0.5 rounded-full">
                      {wishlistProducts.length}
                    </span>
                  )}
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-brand-gold text-white px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Cart Items</p>
                    <p className="text-3xl font-bold text-brand-black">{totalCartItems}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Wishlist</p>
                    <p className="text-3xl font-bold text-brand-black">{wishlistProducts.length}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Orders</p>
                    <p className="text-3xl font-bold text-brand-black">{orders.length}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-brand-black mb-4">Quick Actions</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Link href="/shop">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Products
                      </Button>
                    </Link>
                    <Link href="/wishlist">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        View Wishlist
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-brand-black">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm text-brand-gold hover:text-brand-accent-hover font-medium"
                    >
                      View All
                    </button>
                  </div>
                  {ordersLoading ? (
                    <p className="text-neutral-500 text-sm">Loading...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                          <div>
                            <p className="font-medium text-brand-black">{order.id}</p>
                            <p className="text-sm text-neutral-500">{order.date}</p>
                          </div>
                          <span className={cn("px-3 py-1 text-xs font-medium rounded-full", STATUS_STYLES[order.status] || "bg-neutral-100 text-neutral-800")}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-brand-black mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="text-center py-12 text-neutral-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-neutral-500 mb-4">You haven't placed any orders yet.</p>
                    <Link href="/shop">
                      <Button variant="primary">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-neutral-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                          <div>
                            <p className="font-mono font-bold text-brand-black">{order.id}</p>
                            <p className="text-sm text-neutral-500">{order.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn("px-3 py-1 text-xs font-medium rounded-full", STATUS_STYLES[order.status] || "bg-neutral-100 text-neutral-800")}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                            <div className="text-right">
                              <p className="font-bold text-brand-black">{formatPrice(order.total)}</p>
                              <p className="text-xs text-neutral-500">{order.items} items</p>
                            </div>
                          </div>
                        </div>
                        <details className="group">
                          <summary className="cursor-pointer flex items-center justify-between text-sm text-brand-gold hover:text-brand-accent-hover">
                            <span>View order details</span>
                            <svg className="h-4 w-4 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-4 p-4 bg-neutral-50 rounded-xl space-y-3">
                            <div className="space-y-2">
                              {order.itemsDetail.map((item, i) => {
                                const imageUrl = typeof item.image === 'string' ? item.image : (item.image as { url?: string } | null)?.url ?? '/images/placeholder.png';
                                return (
                                <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-neutral-200">
                                  <img src={imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-brand-black truncate">{item.name}</p>
                                    <p className="text-xs text-neutral-500">Size: {item.size} · {item.color}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-brand-black">{formatPrice(item.price * item.quantity)}</p>
                                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                            <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Subtotal</span>
                                <span className="font-medium text-brand-black">{formatPrice(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Shipping</span>
                                <span className="font-medium text-brand-black">
                                  {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold text-brand-black border-t border-neutral-200 pt-2">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-brand-black">Shipping to:</span>
                                <p className="text-neutral-600">{order.shipping.address}, {order.shipping.city}, {order.shipping.region}</p>
                              </div>
                              <div>
                                <span className="font-medium text-brand-black">Payment:</span>
                                <span className="text-neutral-600">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-brand-black">
                    Saved Items ({wishlistProducts.length})
                  </h2>
                  {wishlistProducts.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearWishlist} className="text-brand-red">
                      Clear All
                    </Button>
                  )}
                </div>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="text-neutral-500 mb-4">Your wishlist is empty.</p>
                    <Link href="/shop">
                      <Button variant="primary">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} />
                        <button
                          onClick={() => removeItem(product.id)}
                          className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-brand-red bg-white rounded-full shadow-card transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-brand-black">Notifications</h2>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-brand-gold">
                      Mark all as read
                    </Button>
                  )}
                </div>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-neutral-50 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-neutral-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                          <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-neutral-500 mb-4">No notifications yet.</p>
                    <p className="text-sm text-neutral-400">We'll notify you about order updates and promotions.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                        className={`flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
                          notification.read
                            ? "bg-white hover:bg-neutral-50"
                            : "bg-brand-gold/5 border border-brand-gold/20 hover:bg-brand-gold/10"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            notification.type === "order"
                              ? "bg-brand-gold/10 text-brand-gold"
                              : "bg-brand-black/10 text-brand-black"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={notification.type === "order" ? "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" : "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-brand-black">{notification.title}</h3>
                            {!notification.read && (
                              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-brand-gold" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-neutral-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="flex-shrink-0 p-2 text-neutral-400 hover:text-brand-gold transition-colors"
                            aria-label="Mark as read"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-brand-black mb-6">Account Settings</h2>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-brand-black mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => updateProfile({ firstName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-brand-black mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => updateProfile({ lastName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateProfile({ email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-brand-black mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="pt-2">
                    <Button variant="primary" type="button" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Changes"}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-brand-black mb-3">Notifications</h3>
                  <div className="space-y-3">
                    {["Order updates", "Promotions & deals", "New arrivals"].map((label) => (
                      <label key={label} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 rounded border-neutral-300 text-brand-black focus:ring-brand-gold"
                        />
                        <span className="text-sm text-neutral-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-brand-black mb-3">Account</h3>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (confirm("Are you sure you want to log out?")) {
                        await signOut();
                        clearProfile();
                        router.push("/sign-in");
                        router.refresh();
                      }
                    }}
                    className="w-full justify-start"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-brand-black mb-3">Danger Zone</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Are you absolutely sure you want to permanently delete your account? This action cannot be undone. All your data including orders, wishlist, and profile information will be permanently removed."
                      );
                      if (!confirmed) return;

                      const result = await deleteAccount();
                      if (result.error) {
                        alert(result.error);
                        return;
                      }
                      router.push("/");
                      router.refresh();
                    }}
                    className="w-full justify-start bg-brand-red hover:bg-red-700 border-brand-red"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
