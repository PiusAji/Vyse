import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import "../globals.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground font-sans">
        <AdminLayoutClient>{children}</AdminLayoutClient>
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
