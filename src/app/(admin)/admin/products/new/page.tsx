import React from "react";
import BackButton from "@/components/ui/BackButton";
import CategoryFetcherClient from "@/components/admin/CategoryFetcherClient";

const CreateProductPage: React.FC = () => {
  return (
    <div className="p-6 bg-background text-foreground min-h-screen font-sans">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
      <CategoryFetcherClient />
    </div>
  );
};

export default CreateProductPage;
