export interface AdminNotification {
  id: string;            // "NTF-..." or "ORD-..."
  orderId: string;       // "ORD-006"
  orderNumber: string;   // same as orderId for display
  customerName: string;  // "Kwame Asante"
  customerPhone: string; // "024 123 4567"
  total: number;         // GHS minor units
  items: { name: string; size: string; qty: number; price: number }[];
  shippingAddress: string; // "12 Independence Avenue, Accra, Greater Accra"
  paymentMethod: "cod" | "momo" | "card";
  createdAt: string;     // ISO timestamp
  read: boolean;
}