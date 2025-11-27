"use client";

import React, { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminCategories } from "@/lib/admin-api";
import { Category } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";

const CategoryFetcherClient: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAdminCategories();
        setCategories(fetchedCategories);
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);
        setError((err as Error).message);
        toast({
          title: "Error",
          description: (err as Error).message || "Failed to fetch categories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return <ProductForm categories={categories} />;
};

export default CategoryFetcherClient;
