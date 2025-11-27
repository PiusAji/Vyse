import React from "react";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface OrdersLayoutProps {
  children: React.ReactNode;
}

const OrdersLayout: React.FC<OrdersLayoutProps> = ({ children }) => {
  const breadcrumbItems = [{ label: "Orders", href: "/admin/orders" }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold">Orders Management</h1>
      {children}
    </div>
  );
};

export default OrdersLayout;
