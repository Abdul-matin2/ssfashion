"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== "all"
        ? `/api/admin/orders?status=${statusFilter}`
        : "/api/admin/orders";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      cod: "Cash on Delivery",
      momo: "Mobile Money",
      card: "Card",
    };
    return labels[method] || method;
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Orders</h1>
        <p className="text-neutral-500 mt-1">Manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Total Orders</p>
          <p className="text-2xl font-bold text-brand-black">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Revenue</p>
          <p className="text-2xl font-bold text-brand-green">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === opt.value
                ? "bg-brand-black text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Items</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand-black">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-brand-black">{order.shipping.firstName} {order.shipping.lastName}</p>
                        <p className="text-sm text-neutral-500">{order.shipping.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => {
                            const imageUrl = typeof item.image === 'object' ? item.image.url : item.image;
                            return (
                              <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white bg-neutral-100">
                                <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-sm text-neutral-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand-black">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">{getPaymentLabel(order.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        className={cn(
                          "text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer",
                          STATUS_STYLES[order.status]
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-500">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
