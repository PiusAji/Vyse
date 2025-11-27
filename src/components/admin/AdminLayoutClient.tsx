"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import SidebarNavigation from "@/components/admin/SidebarNavigation";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

const AdminLayoutClient: React.FC<AdminLayoutClientProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isLoginPage) {
        setIsLoading(false);
        setIsAuthenticatedAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/auth/verify");
        const data = await response.json();

        if (!data.isAuthenticated || !data.isAdmin) {
          router.replace("/admin/login");
        } else {
          setIsAuthenticatedAdmin(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AdminLayout authentication error:", error);
        router.replace("/admin/login");
      }
    };

    checkAdminStatus();
  }, [pathname, router, isLoginPage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && !isLoginPage) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prevProgress + 5;
        });
      }, 100);
    } else {
      setProgress(100);
      clearInterval(interval!);
    }
    return () => clearInterval(interval);
  }, [isLoading, isLoginPage]);

  if (isLoading && !isLoginPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-white">VYSE</h1>
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticatedAdmin && !isLoginPage) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen">
        {!isLoginPage && <SidebarNavigation />}
        <div className="flex flex-col flex-1 overflow-x-auto">
          {!isLoginPage && <AdminHeader />}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </>
  );
};

export default AdminLayoutClient;
