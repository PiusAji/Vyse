// hooks/use-auth-hydration.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { checkAuthStatus } from "@/lib/auth-api";

export const useAuthHydration = () => {
  const { isAuthenticated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const checkAndHydrateAuth = async () => {
      // Only validate if user appears to be logged in
      if (!isAuthenticated) {
        return;
      }

      setIsValidating(true);

      try {
        const { isAuthenticated: serverAuth } = await checkAuthStatus();

        // Only logout if server explicitly says not authenticated
        if (!serverAuth) {
          useAuthStore.getState().logout();
        }
      } catch (error) {
        console.error("Failed to check auth status on hydration:", error);
        // DON'T logout on network errors - keep user logged in
        // They'll get logged out naturally if their next API call fails
      } finally {
        setIsValidating(false);
      }
    };

    checkAndHydrateAuth();
  }, [isAuthenticated]);

  return isValidating;
};
