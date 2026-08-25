import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getProducts, getFeaturedProducts, getNewProducts, getBrands, getCategories } from "@/lib/supabase/queries";
import { createAdminClient } from "@/lib/supabase/server";
import { Order } from "@/types/product";

async function readOrders(): Promise<Order[]> {
  try {
    const supabase = await createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          name,
          image_url,
          size,
          color,
          qty,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading orders:", error);
      return [];
    }

    // Transform to match Order interface
    return (orders || []).map((order: any) => ({
      id: order.id,
      items: (order.order_items || []).map((item: any) => ({
        productId: item.product_id || "",
        name: item.name,
        brand: "",
        image: item.image_url || "",
        price: item.price,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        colorHex: undefined,
      })),
      shipping: {
        email: order.customer_email || "",
        firstName: order.customer_name?.split(" ")[0] || "",
        lastName: order.customer_name?.split(" ").slice(1).join(" ") || "",
        phone: order.customer_phone || "",
        address: order.shipping_address?.address || "",
        city: order.shipping_address?.city || "",
        region: order.shipping_address?.region || "",
        notes: "",
      },
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      shippingFee: order.delivery_fee,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status || "pending",
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));
  } catch (error) {
    console.error("Error reading orders:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const [{ products: allProducts, total: totalProducts }, featuredProductsData, newProductsData, orders] = await Promise.all([
    getProducts({ limit: 1000 }),
    getFeaturedProducts(1000),
    getNewProducts(1000),
    readOrders(),
  ]);

  const featuredProducts = featuredProductsData.length;
  const newProducts = newProductsData.length;
  const lowStockProducts = allProducts.filter((p) =>
    p.sizes.filter((s) => s.inStock).length < 3
  ).length;

  const recentProducts = allProducts.slice(-5).reverse();

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum: number, o) => sum + o.total, 0),
  };

  const stats = [
    {
      name: "Total Products",
      value: totalProducts,
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      color: "bg-brand-black",
      iconColor: "text-brand-white",
    },
    {
      name: "Featured",
      value: featuredProducts,
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
      color: "bg-brand-gold",
      iconColor: "text-brand-black",
    },
    {
      name: "New Arrivals",
      value: newProducts,
      icon: "M12 4v16m8-8H4",
      color: "bg-brand-orange",
      iconColor: "text-brand-white",
    },
    {
      name: "Low Stock",
      value: lowStockProducts,
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      color: "bg-brand-red",
      iconColor: "text-brand-white",
    },
    {
      name: "Total Orders",
      value: orderStats.total,
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
      color: "bg-blue-600",
      iconColor: "text-brand-white",
    },
    {
      name: "Pending Orders",
      value: orderStats.pending,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "bg-yellow-600",
      iconColor: "text-brand-white",
    },
    {
      name: "Revenue",
      value: formatPrice(orderStats.revenue),
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "bg-brand-green",
      iconColor: "text-brand-white",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Manage your store products and view analytics</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-brand-black">{stat.value}</p>
              </div>
              <div className={cn("p-4 rounded-xl", stat.color)}>
                <svg className={cn("h-8 w-8", stat.iconColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Products */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-brand-black mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/products/new">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Manage All Products
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  View Storefront
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-black">Recent Products</h2>
              <Link href="/admin/products" className="text-sm text-brand-gold hover:text-brand-accent-hover font-medium">
                View All
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-neutral-500 mb-4">No products yet.</p>
                <Link href="/admin/products/new">
                  <Button variant="primary" size="sm">Add First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {recentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.url || "/images/placeholder.png"}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded-lg bg-neutral-100"
                            />
                            <div>
                              <p className="font-medium text-brand-black">{product.name}</p>
                              <p className="text-xs text-neutral-500">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className="text-sm text-neutral-700">{product.brand}</span>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell">
                          <span className="text-sm text-neutral-700">{product.category}</span>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-brand-black">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-4 px-4 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1.5">
                            {product.isFeatured && <Badge variant="featured" size="sm">Featured</Badge>}
                            {product.isNew && <Badge variant="new" size="sm">New</Badge>}
                            {product.compareAtPrice && <Badge variant="sale" size="sm">Sale</Badge>}
                            {product.sizes.filter((s) => s.inStock).length === 0 && <Badge variant="out-of-stock" size="sm">Out of Stock</Badge>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link href={`/admin/products/${product.id}/edit`} className="text-sm text-brand-gold hover:text-brand-accent-hover font-medium">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}