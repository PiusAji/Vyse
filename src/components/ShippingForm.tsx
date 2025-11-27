"use client";

import { useState, useEffect } from "react";
import { useCheckoutStore, ShippingAddress } from "@/store/checkout-store";
import { useAuthStore } from "@/store/auth-store";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserProfile } from "@/lib/profile-api";

interface ShippingFormProps {
  onContinue: (options?: { saveShippingAddress: boolean }) => void;
}

export default function ShippingForm({ onContinue }: ShippingFormProps) {
  const { user } = useAuthStore();
  const {
    shippingAddress,
    setShippingAddress,
    useSameAddress,
    setUseSameAddress,
  } = useCheckoutStore();
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [saveAddress, setSaveAddress] = useState(false);

  // Load saved shipping address from profile if user is logged in
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (user) {
        try {
          const profile = await getUserProfile();
          if (
            profile.addresses &&
            Array.isArray(profile.addresses) &&
            profile.addresses.length > 0
          ) {
            const savedAddress = profile.addresses[0];
            const address = {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email,
              phone: savedAddress.phone || "",
              address: savedAddress.street || "",
              city: savedAddress.city || "",
              state: savedAddress.state || "",
              zipCode: savedAddress.zipCode || "",
              country: savedAddress.country || "", // No default country
            };
            setShippingAddress(address);
            // Also update the checkout store's initial state
            useCheckoutStore.setState({ shippingAddress: address });
          } else {
            // Fallback to basic user info if no saved address
            setShippingAddress({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email,
              phone: "",
              address: "",
              city: "",
              state: "",
              zipCode: "",
              country: "", // No default country
            });
          }
        } catch (error) {
          console.error("Failed to load saved address:", error);
          // Fallback to basic user info if profile fetch fails
          setShippingAddress({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "", // No default country
          });
        }
      }
    };

    loadSavedAddress();
  }, [user?.id, setShippingAddress]); // Reload when user.id changes

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!shippingAddress.firstName.trim())
      newErrors.firstName = "First name required";
    if (!shippingAddress.lastName.trim())
      newErrors.lastName = "Last name required";
    if (!shippingAddress.email.trim()) newErrors.email = "Email required";
    if (!shippingAddress.address.trim()) newErrors.address = "Address required";
    if (!shippingAddress.city.trim()) newErrors.city = "City required";
    if (!shippingAddress.state.trim()) newErrors.state = "State required";
    if (!shippingAddress.zipCode.trim())
      newErrors.zipCode = "ZIP code required";
    if (!shippingAddress.country.trim()) newErrors.state = "Country required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onContinue({
        saveShippingAddress: saveAddress && !!user,
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-foreground tracking-wide">
        Shipping Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              First Name
            </label>
            <input
              type="text"
              value={shippingAddress.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md 
                text-foreground placeholder-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-destructive text-sm mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={shippingAddress.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md 
                text-foreground placeholder-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            value={shippingAddress.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md 
              text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={shippingAddress.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md 
              text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Address
          </label>
          <input
            type="text"
            value={shippingAddress.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md 
              text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="123 Main Street"
          />
          {errors.address && (
            <p className="text-destructive text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              City
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md 
                text-foreground placeholder-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="New York"
            />
            {errors.city && (
              <p className="text-destructive text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              State
            </label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md 
                text-foreground placeholder-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="NY"
            />
            {errors.state && (
              <p className="text-destructive text-sm mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={shippingAddress.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md 
                text-foreground placeholder-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="10001"
            />
            {errors.zipCode && (
              <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Country
          </label>
          <input
            type="text"
            value={shippingAddress.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md
              text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="United States"
          />
        </div>

        {user && (
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="saveAddress"
              checked={saveAddress}
              onCheckedChange={(checked) => setSaveAddress(!!checked)}
            />
            <label htmlFor="saveAddress" className="text-sm text-foreground">
              Save this shipping address to my profile
            </label>
          </div>
        )}

        {/* Same Address Checkbox */}
        <div className="flex items-center space-x-2 pt-4">
          <input
            type="checkbox"
            id="same-address"
            checked={useSameAddress}
            onChange={(e) => setUseSameAddress(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded 
              focus:ring-ring focus:ring-2"
          />
          <label htmlFor="same-address" className="text-sm text-foreground">
            Billing address is the same as shipping address
          </label>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md 
            font-medium tracking-wide hover:bg-primary/90 transition-colors
            focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
