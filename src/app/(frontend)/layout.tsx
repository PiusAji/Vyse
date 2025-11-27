import type { Metadata } from "next";
import "../globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "VYSE - Premium Footwear",
  description: "Discover premium shoes and sneakers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased pt-16">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
