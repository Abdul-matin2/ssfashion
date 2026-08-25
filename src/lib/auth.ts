/**
 * Simple admin authentication utilities
 * Uses a password hash from environment variable
 * Session stored in cookie (since sessionStorage isn't sent with requests)
 */

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// Default password hash for "Baawa@26" - in production, set ADMIN_PASSWORD_HASH env var
// Generated with: bcrypt.hashSync("Baawa@26", 10)
const DEFAULT_PASSWORD_HASH = "$2b$10$MJ8T94gc/HIVL1zbbBMHyupV3b5Ass3Mlz0OsHuqOqLDyW.SBq7m.";

function getPasswordHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = getPasswordHash();

  // Use bcrypt for verification
  if (hash.startsWith("$2b$")) {
    return bcrypt.compareSync(password, hash);
  }

  // Fallback: direct comparison (not secure, only for demo)
  return password === hash;
}

export function createAuthCookie(): string {
  // Cookie expires in 24 hours
  return "admin-auth=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400";
}

export function clearAuthCookie(): string {
  return "admin-auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "true";
}