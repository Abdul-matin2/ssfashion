import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await getProducts({ limit: 200 });

  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-brand-gold">Loading shop...</div></div>}>
      <ShopClient products={products} />
    </Suspense>
  );
}