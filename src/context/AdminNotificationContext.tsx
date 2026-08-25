"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { AdminNotification } from "@/types/notification";

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<AdminNotification, "id" | "read">) => Promise<void>;
  getNotificationByOrderId: (orderId: string) => AdminNotification | undefined;
  refetch: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

const POLL_INTERVAL = 15000; // 15 seconds

export function AdminNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const addNotification = useCallback(
    async (notification: Omit<AdminNotification, "id" | "read">) => {
      const newNotification: AdminNotification = {
        ...notification,
        id: `NTF-${Date.now()}`,
        read: false,
      };
      // Optimistic update
      setNotifications((prev) => [newNotification, ...prev]);

      try {
        const res = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        });
        if (!res.ok) {
          fetchNotifications();
        }
      } catch (error) {
        console.error("Failed to add notification:", error);
        fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  const getNotificationByOrderId = useCallback(
    (orderId: string) => {
      return notifications.find((n) => n.orderId === orderId);
    },
    [notifications]
  );

  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const value: AdminNotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    getNotificationByOrderId,
    refetch,
  };

  return (
    <AdminNotificationContext.Provider value={value}>{children}</AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error("useAdminNotifications must be used within an AdminNotificationProvider");
  }
  return context;
}