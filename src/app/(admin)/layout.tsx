import { Metadata } from "next";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "VYSE - Admin",
    template: "%s | VYSE Admin",
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground font-sans">
        <AdminLayoutClient>{children}</AdminLayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
