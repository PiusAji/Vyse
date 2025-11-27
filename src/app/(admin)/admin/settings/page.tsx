import React from "react";
import Breadcrumb from "@/components/admin/Breadcrumb";

const SettingsPage: React.FC = () => {
  const breadcrumbItems = [{ label: "Settings", href: "/admin/settings" }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Application settings will go here.
      </p>
    </div>
  );
};

export default SettingsPage;
