export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  commissionRate: number; // percentage (e.g., 10 for 10%)
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  commission: number;
  status: "pending" | "approved" | "paid" | "cancelled";
  createdAt: string;
}