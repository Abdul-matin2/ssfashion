"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getUser, onAuthStateChange, updateProfile as updateSupabaseProfile } from "@/lib/supabase/auth";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  clearProfile: () => void;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  country: "",
};

const STORAGE_KEY = "ssfashion_user_profile";

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user profile from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (error) {
        console.error("Failed to save user profile to localStorage:", error);
      }
    }
  }, [profile, isLoaded]);

  // Sync with Supabase auth state
  useEffect(() => {
    let mounted = true;

    const syncProfile = async () => {
      try {
        const user = await getUser();
        if (user) {
          // User is logged in - populate profile from Supabase user metadata
          const meta = user.user_metadata || {};
          setProfile((prev) => ({
            ...prev,
            firstName: meta.first_name || meta.full_name?.split(" ")[0] || prev.firstName,
            lastName: meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || prev.lastName,
            email: user.email || prev.email,
            phone: meta.phone || prev.phone,
            country: meta.country || prev.country,
            region: meta.region || prev.region,
          }));
        } else {
          // User logged out - clear profile
          setProfile(DEFAULT_PROFILE);
        }
      } catch (error) {
        console.error("Failed to sync profile with Supabase:", error);
      }
    };

    syncProfile();

    // Subscribe to auth changes
    const subscription = onAuthStateChange((event) => {
      if (mounted) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          syncProfile();
        } else if (event === "SIGNED_OUT") {
          setProfile(DEFAULT_PROFILE);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    // Update local state immediately for responsive UI
    setProfile((prev) => ({ ...prev, ...updates }));

    // Persist to Supabase
    const supabaseData: Record<string, string> = {};
    if (updates.firstName !== undefined) supabaseData.first_name = updates.firstName;
    if (updates.lastName !== undefined) supabaseData.last_name = updates.lastName;
    if (updates.email !== undefined) supabaseData.email = updates.email;
    if (updates.phone !== undefined) supabaseData.phone = updates.phone;
    if (updates.country !== undefined) supabaseData.country = updates.country;
    if (updates.region !== undefined) supabaseData.region = updates.region;
    // Note: address and city are stored locally only (not in Supabase user_metadata)

    if (Object.keys(supabaseData).length > 0) {
      const { error } = await updateSupabaseProfile(supabaseData);
      if (error) {
        console.error("Failed to update profile in Supabase:", error);
        return { error };
      }
    }

    return { error: null };
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Failed to delete account" };
      }
      // Clear local profile on successful deletion
      setProfile(DEFAULT_PROFILE);
      return { error: null };
    } catch {
      return { error: "Something went wrong. Please try again." };
    }
  }, []);

  const value: UserProfileContextType = {
    profile,
    updateProfile,
    clearProfile,
    deleteAccount,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}