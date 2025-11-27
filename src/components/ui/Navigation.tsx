"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartIcon } from "./CartIcon";
import { useAuthStore } from "@/store/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { User, LogIn, Menu, X } from "lucide-react";
import AuthDrawer from "../LoginForm";
import { CartDrawer } from "../CartDrawer";
import ProfileDrawer from "../ProfileDrawer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Navigation structure with submenus
const NAVIGATION = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Shoes" },
  {
    label: "Collections",
    submenu: [
      {
        title: "Men's Collection",
        href: "/men",
        description: "Crafted for the modern gentleman",
        image: "/screenshoot/MenHero.webp",
      },
      {
        title: "Women's Collection",
        href: "/women",
        description: "Designed for the confident woman",
        image: "/screenshoot/WomenHero.webp",
      },
      {
        title: "Sneakers",
        href: "/collections/sneakers",
        description: "Street-ready performance",
        image: "/screenshoot/SneakersHero.webp",
      },
      {
        title: "Boots",
        href: "/collections/boots",
        description: "Built to last, made to impress",
        image: "/screenshoot/BootsHero.webp",
      },
    ],
  },
  { href: "/our-story", label: "Our Story" },
  { href: "/sale", label: "Sale", highlight: true },
];

export default function Navigation() {
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  useAuthHydration();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email.split("@")[0];
  };

  const renderAuthSection = () => {
    if (!isAuthenticated) {
      return (
        <button
          onClick={() => setIsAuthDrawerOpen(true)}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-sm font-medium">Sign In</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setIsProfileDrawerOpen(true)}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {getDisplayName()}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav
        className={`fixed px-4 top-0 left-0 right-0 z-50 transition-all duration-800 ${
          scrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent/95"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex justify-between items-center h-16 border-b transition-colors duration-800 ${
              scrolled ? "border-border" : "border-white"
            }`}
          >
            <Link href="/" className="text-2xl font-bold z-50">
              VYSE
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8 items-center">
              {NAVIGATION.map((item) =>
                item.submenu ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <button className="text-muted-foreground hover:text-foreground transition-colors h-full flex items-center">
                      {item.label}
                    </button>

                    <AnimatePresence>
                      {activeMenu === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                        >
                          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 min-w-[850px]">
                            <div className="grid grid-cols-2 gap-4">
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.href}
                                  href={subitem.href}
                                  className="group p-5 rounded-xl hover:bg-accent transition-all duration-300 flex gap-5"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <div className="relative w-36 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={subitem.image}
                                      alt={subitem.title}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                      {subitem.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {subitem.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`transition-colors ${
                      item.highlight
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex min-w-[120px] justify-end">
                {renderAuthSection()}
              </div>

              <CartIcon onClick={() => setIsCartDrawerOpen(true)} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-foreground"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-b border-border bg-background/95 backdrop-blur"
            >
              <div className="container mx-auto px-4 py-6 space-y-4">
                {NAVIGATION.map((item) =>
                  item.submenu ? (
                    <div key={item.label} className="space-y-2">
                      <div className="font-semibold text-foreground">
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-2">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="font-medium">{subitem.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {subitem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={`block py-2 transition-colors ${
                        item.highlight
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                )}

                <div className="pt-4 border-t border-border">
                  {renderAuthSection()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </>
  );
}
