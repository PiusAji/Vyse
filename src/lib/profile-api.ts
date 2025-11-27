// Client-side API functions for user profile management
import { useAuthStore } from "@/store/auth-store";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    country?: string;
  }>;
  createdAt: string;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selectedOptions: {
    size: string;
    color: string;
  };
  product: {
    id: string;
    name: string;
    brand: string;
    images: string[];
    price: number;
  };
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    country?: string;
  }>;
  currentPassword?: string;
  newPassword?: string;
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch("/api/user/profile", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Authentication expired. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  const data = await response.json();
  return data.user;
}

// Update user profile
export async function updateUserProfile(
  profileData: UpdateProfileData
): Promise<UserProfile> {
  const response = await fetch("/api/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Authentication expired. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  const data = await response.json();
  return data.user;
}

// Get user order history
export async function getUserOrders(): Promise<Order[]> {
  const response = await fetch("/api/user/orders", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Authentication expired. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch orders");
  }

  const data = await response.json();
  return data.orders;
}

// Save shipping address to user profile
export async function saveShippingAddress(address: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}): Promise<UserProfile> {
  const response = await fetch("/api/user/profile/shipping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Authentication expired. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to save shipping address");
  }

  const data = await response.json();
  return data.user;
}
