import React from "react";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface ProductsLayoutProps {
  children: React.ReactNode;
}

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  const breadcrumbItems = [{ label: "Products", href: "/admin/products" }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold">Products Management</h1>
      {children}
    </div>
  );
};

export default ProductsLayout;
