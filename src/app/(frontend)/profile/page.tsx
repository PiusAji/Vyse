import { Suspense } from "react";
import { ProfilePageClient } from "@/components/ProfilePageClient";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfilePageClient />
      </Suspense>
    </div>
  );
}
