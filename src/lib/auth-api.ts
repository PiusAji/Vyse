// lib/auth-api.ts (or add to your existing lib/api.ts)

export const signupUser = async (userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  return response.json();
};

export const checkEmailExists = async (email: string) => {
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to check email");
  }

  return response.json();
};

export const checkAuthStatus = async () => {
  const response = await fetch("/api/auth/status", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return { isAuthenticated: false };
  }

  if (!response.ok) {
    throw new Error("Failed to check authentication status");
  }

  return response.json();
};

export const adminLogin = async (email: string, password: string) => {
  const response = await fetch("/api/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Admin login failed");
  }

  return data;
};

export const adminLogout = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Admin logout failed");
  }

  return response.json();
};
