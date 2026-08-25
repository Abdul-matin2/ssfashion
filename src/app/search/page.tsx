import { Suspense } from "react";
import { getProducts } from "@/lib/supabase/queries";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const { products } = await getProducts({ limit: 500 });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-brand-gold">Loading search...</div>
        </div>
      }
    >
      <SearchClient products={products} />
    </Suspense>
  );
}