"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@prisma/client";
import BackButton from "@/components/ui/BackButton";

const EditUserPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/users/${id}`);
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setUser(data);
        } catch (err) {
          console.error("Failed to fetch user:", err);
          setError("Failed to load user data.");
          toast({
            title: "Error",
            description: "Failed to load user data.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, toast]);

  if (loading) {
    return <div className="p-6">Loading user...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold">Edit User: {user.email}</h1>
      </div>
      <UserForm initialData={user} />
    </div>
  );
};

export default EditUserPage;
