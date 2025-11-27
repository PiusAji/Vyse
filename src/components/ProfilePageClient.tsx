"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { useAuthStore } from "@/store/auth-store";
import {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  UserProfile,
  Order,
} from "@/lib/profile-api";
import { User, Package, Settings, Eye, EyeOff, Truck } from "lucide-react";
import { Feedback } from "@/components/ui/Feedback";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export function ProfilePageClient() {
  const { user, logout } = useAuthStore();
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const paymentSuccess = searchParams.get("paymentSuccess"); // Get paymentSuccess from URL
  const initialTab =
    paymentSuccess === "true" ? "orders" : searchParams.get("tab") || "profile"; // Get tab from URL, prioritize 'orders' if payment was successful
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [shippingMessage, setShippingMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState(""); // New state for order messages
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    country: "",
  });

  useEffect(() => {
    loadData();
    if (paymentSuccess === "true") {
      setOrderMessage("Your order has been placed successfully!");
      // Remove paymentSuccess from URL after displaying the message
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("paymentSuccess");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [paymentSuccess]); // Add paymentSuccess to dependency array

  const loadData = async () => {
    try {
      const [profileData, ordersData] = await Promise.all([
        getUserProfile(),
        getUserOrders(),
      ]);

      setProfile(profileData);
      setOrders(ordersData);
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        street: profileData.addresses?.[0]?.street || "",
        city: profileData.addresses?.[0]?.city || "",
        state: profileData.addresses?.[0]?.state || "",
        zipCode: profileData.addresses?.[0]?.zipCode || "",
        phone: profileData.addresses?.[0]?.phone || "",
        country: profileData.addresses?.[0]?.country || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to load profile data:", error);
      setProfileMessage("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setProfileMessage("Updating profile...");

    try {
      const updatedProfile = await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      setProfile(updatedProfile);
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveShippingAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setShippingMessage("Saving shipping address...");

    try {
      const addressData = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        country: formData.country,
      };

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        addresses: [addressData],
      };

      const updatedProfile = await updateUserProfile(updateData);
      setProfile(updatedProfile);
      setShippingMessage("Shipping address saved successfully");

      // Reload form data to ensure consistency
      setFormData((prev) => ({
        ...prev,
        ...addressData,
      }));
    } catch (error) {
      setShippingMessage(
        error instanceof Error
          ? error.message
          : "Failed to update shipping address"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={initialTab} // Use initialTab from URL
      onValueChange={(value) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("tab", value);
        window.history.replaceState({}, "", newUrl.toString());
      }}
      className="flex flex-col lg:flex-row gap-12 lg:items-start"
    >
      <TabsList className="flex flex-row lg:flex-col h-auto bg-transparent p-0 lg:w-[200px] items-start">
        <TabsTrigger
          value="profile"
          className="w-full justify-start gap-3 px-4 py-3"
        >
          <User size={20} />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="w-full justify-start gap-3 px-4 py-3"
        >
          <Truck size={20} />
          Shipping
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="w-full justify-start gap-3 px-4 py-3"
        >
          <Package size={20} />
          Orders ({orders.length})
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="w-full justify-start gap-3 px-4 py-3"
        >
          <Settings size={20} />
          Settings
        </TabsTrigger>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          onClick={logout}
        >
          Sign Out
        </Button>
      </TabsList>

      <div className="flex-1">
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Feedback
                message={profileMessage}
                variant={
                  profileMessage.includes("successfully") ? "success" : "error"
                }
                onDismiss={() => setProfileMessage("")}
              />
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>
                Manage your saved shipping addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Feedback
                message={shippingMessage}
                variant={
                  shippingMessage.includes("successfully") ? "success" : "error"
                }
                onDismiss={() => setShippingMessage("")}
              />
              <form onSubmit={handleSaveShippingAddress} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your past purchases and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Feedback
                message={orderMessage}
                variant="success"
                onDismiss={() => setOrderMessage("")}
              />
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your order history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium">
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${order.total.toFixed(2)}
                            </p>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                order.status === "PAID"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : order.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4"
                            >
                              <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-muted">
                                {item.product?.images?.[0] && ( // Added optional chaining
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.product?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.product?.brand} • Size:{" "}
                                  {item.selectedOptions.size} • Color:{" "}
                                  {item.selectedOptions.color}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × $
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Member since:{" "}
                    {profile &&
                      new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account ID: {profile?.id.slice(-8)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Theme settings and notification preferences coming soon
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
