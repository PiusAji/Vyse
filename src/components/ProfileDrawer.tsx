"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { User, Package, Settings, LogOut, X, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, logout } = useAuthStore();

  // Handle ESC key and scroll prevention
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        // Restore body scroll
        document.body.style.overflow = "unset";
      };
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email.split("@")[0];
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      description: "Manage your account settings",
    },
    {
      icon: Package,
      label: "Orders",
      href: "/profile",
      description: "View your order history",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/profile",
      description: "Account preferences",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[100] ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-2xl transform transition-transform z-[101] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-card-foreground">
              Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-card min-h-0 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}</style>

          <div className="max-w-sm mx-auto">
            {/* User Profile Section */}
            <div className="animate-in slide-in-from-right-5 duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-1">
                  {getDisplayName()}
                </h3>
                <div className="bg-muted/50 rounded-lg px-3 py-1 inline-block">
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-3 mb-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:bg-accent hover:border-accent transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground group-hover:text-accent-foreground transition-colors">
                          {item.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Member since
                    </p>
                    <p className="font-medium text-card-foreground">
                      {user?.createdAt
                        ? new Date(user.createdAt).getFullYear()
                        : "Recently"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total orders
                    </p>
                    <p className="font-medium text-card-foreground">0</p>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Need help?{" "}
                  <button className="text-primary hover:underline transition-colors">
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
