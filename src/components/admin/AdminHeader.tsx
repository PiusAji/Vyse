"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/auth-api";

const AdminHeader: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await adminLogout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Admin logout failed:", error);
      // Optionally, display an error message to the user
    }
  };
  return (
    <header className="bg-background text-foreground border-b border-border p-4 flex items-center justify-between font-sans">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-lg font-bold">
          Admin Dashboard
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">Welcome, Admin</span>
        {/* Placeholder for user menu/avatar */}
        <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
          A
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-sm">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
