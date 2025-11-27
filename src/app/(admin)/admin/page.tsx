import React from "react";
import { DollarSign, Package, Users, CreditCard } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Breadcrumb from "@/components/admin/Breadcrumb";

const AdminDashboard: React.FC = () => {
  const breadcrumbItems = [{ label: "Dashboard", href: "/admin" }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231.89"
          description="+20.1% from last month"
          icon={DollarSign}
        />
        <StatsCard
          title="Subscriptions"
          value="+2350"
          description="+180.1% from last month"
          icon={Users}
        />
        <StatsCard
          title="Sales"
          value="+12,234"
          description="+19% from last month"
          icon={CreditCard}
        />
        <StatsCard
          title="Active Now"
          value="+573"
          description="+201 since last hour"
          icon={Package}
        />
      </div>

      {/* Placeholder for recent orders or other dashboard elements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <p className="text-muted-foreground">Order list will go here.</p>
        </div>
        <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Trends</h2>
          <p className="text-muted-foreground">
            Charts and graphs will go here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
