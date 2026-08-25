"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import ProductForm from "../../ProductForm";
import { Product } from "@/types/product";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-brand-black mb-2">Product not found</h2>
        <p className="text-neutral-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push("/admin/products")} variant="outline">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand-black">Edit Product</h1>
        <p className="text-neutral-600 mt-1">
          Editing <span className="font-medium text-brand-black">{product.name}</span>
        </p>
      </div>
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}