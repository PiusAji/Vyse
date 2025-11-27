import React from "react";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { UserForm } from "@/components/admin/UserForm";

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-8">
      <Breadcrumb
        items={[
          { label: "Users", href: "/admin/users" },
          { label: "New User" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">Create New User</h1>
      <UserForm />
    </div>
  );
}
