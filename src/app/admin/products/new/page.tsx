import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand-black">Add New Product</h1>
        <p className="text-neutral-600 mt-1">Fill in the details below to add a product to your catalog</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}