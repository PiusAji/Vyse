"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, PlusCircle, XCircle } from "lucide-react";
import { Address } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast"; // Assuming this is a custom hook or component
import { Feedback } from "@/components/ui/Feedback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductVariantOption {
  id: string;
  color: string;
  sizes: string[];
  stock: number;
  productName: string;
  productPrice: number;
}

interface OrderItemForm {
  productVariantId: string;
  quantity: number;
  selectedSize?: string;
  priceAtPurchase: number; // To store the price when added
  productName: string;
  color: string;
}

const NewOrderPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
    phone: "",
  });
  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
    phone: "",
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductVariantOption[]>(
    []
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedProductVariant, setSelectedProductVariant] =
    useState<ProductVariantOption | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await fetch(
            `/api/admin/products?search=${searchQuery}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch products");
          }
          const data: {
            products: {
              name: string;
              price: number;
              variants: {
                id: string;
                color: string;
                sizes: string;
                stock: number;
              }[];
            }[];
          } = await response.json();
          const variants: ProductVariantOption[] = [];
          data.products.forEach((product) => {
            product.variants.forEach((variant) => {
              variants.push({
                id: variant.id,
                color: variant.color,
                sizes: JSON.parse(variant.sizes),
                stock: variant.stock,
                productName: product.name,
                productPrice: product.price,
              });
            });
          });
          setSearchResults(variants);
        } catch (error) {
          console.error("Error searching products:", error);
          toast({
            title: "Error",
            description: "Failed to search products.",
            variant: "destructive",
          });
        }
      } else {
        setSearchResults([]);
      }
    };
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchQuery, toast]);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: "shipping" | "billing"
  ) => {
    const { name, value } = e.target;
    if (type === "shipping") {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
      if (useSameAddress) {
        setBillingAddress((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setBillingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUseSameAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseSameAddress(e.target.checked);
    if (e.target.checked) {
      setBillingAddress(shippingAddress);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductVariant) {
      toast({
        title: "Error",
        description: "Please select a product variant.",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedQuantity <= 0 ||
      selectedQuantity > selectedProductVariant.stock
    ) {
      toast({
        title: "Error",
        description: `Quantity must be between 1 and ${selectedProductVariant.stock}.`,
        variant: "destructive",
      });
      return;
    }

    if (selectedProductVariant.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Error",
        description: "Please select a size for the product.",
        variant: "destructive",
      });
      return;
    }

    setOrderItems((prev) => [
      ...prev,
      {
        productVariantId: selectedProductVariant.id,
        quantity: selectedQuantity,
        selectedSize: selectedSize || undefined,
        priceAtPurchase: selectedProductVariant.productPrice,
        productName: selectedProductVariant.productName,
        color: selectedProductVariant.color,
      },
    ]);

    // Reset item selection fields
    setSearchQuery("");
    setSearchResults([]);
    setSelectedVariantId("");
    setSelectedProductVariant(null); // Clear the selected product variant
    setSelectedQuantity(1);
    setSelectedSize("");
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // setError(null); // Removed as Feedback component handles error display

    if (!userId && !guestEmail) {
      toast({
        title: "Validation Error",
        description: "Either User ID or Guest Email must be provided.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Order must contain at least one item.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId || undefined,
          guestEmail: guestEmail || undefined,
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : billingAddress,
          orderItems: orderItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      setLoading(false); // Reset loading state before redirect
      toast({
        title: "Success",
        description: "Order created successfully!",
      });
      router.push("/admin/orders"); // Redirect to orders list
    } catch (err: unknown) {
      console.error("Error creating order:", err);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to create order.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading state is reset on error
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <h1 className="text-3xl font-bold">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">
                User ID (Optional, for existing users)
              </Label>
              <Input
                id="userId"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter existing user ID"
              />
            </div>
            <p className="text-center text-muted-foreground">OR</p>
            <div>
              <Label htmlFor="guestEmail">
                Guest Email (Optional, for new guest orders)
              </Label>
              <Input
                id="guestEmail"
                name="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Enter guest email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shippingFirstName">First Name</Label>
              <Input
                id="shippingFirstName"
                name="firstName"
                value={shippingAddress.firstName}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingLastName">Last Name</Label>
              <Input
                id="shippingLastName"
                name="lastName"
                value={shippingAddress.lastName}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingAddress">Address</Label>
              <Textarea
                id="shippingAddress"
                name="address"
                value={shippingAddress.address}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  name="city"
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange(e, "shipping")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shippingState">State</Label>
                <Input
                  id="shippingState"
                  name="state"
                  value={shippingAddress.state}
                  onChange={(e) => handleAddressChange(e, "shipping")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shippingZipCode">Zip Code</Label>
                <Input
                  id="shippingZipCode"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleAddressChange(e, "shipping")}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="shippingCountry">Country</Label>
              <Input
                id="shippingCountry"
                name="country"
                value={shippingAddress.country}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingEmail">Email</Label>
              <Input
                id="shippingEmail"
                name="email"
                type="email"
                value={shippingAddress.email}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingPhone">Phone</Label>
              <Input
                id="shippingPhone"
                name="phone"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange(e, "shipping")}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useSameAddress"
                checked={useSameAddress}
                onChange={handleUseSameAddressChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="useSameAddress">Same as Shipping Address</Label>
            </div>

            {!useSameAddress && (
              <>
                <div>
                  <Label htmlFor="billingFirstName">First Name</Label>
                  <Input
                    id="billingFirstName"
                    name="firstName"
                    value={billingAddress.firstName}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="billingLastName">Last Name</Label>
                  <Input
                    id="billingLastName"
                    name="lastName"
                    value={billingAddress.lastName}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="billingAddress">Address</Label>
                  <Textarea
                    id="billingAddress"
                    name="address"
                    value={billingAddress.address}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      name="city"
                      value={billingAddress.city}
                      onChange={(e) => handleAddressChange(e, "billing")}
                      required={!useSameAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      name="state"
                      value={billingAddress.state}
                      onChange={(e) => handleAddressChange(e, "billing")}
                      required={!useSameAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingZipCode">Zip Code</Label>
                    <Input
                      id="billingZipCode"
                      name="zipCode"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleAddressChange(e, "billing")}
                      required={!useSameAddress}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billingCountry">Country</Label>
                  <Input
                    id="billingCountry"
                    name="country"
                    value={billingAddress.country}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="billingEmail">Email</Label>
                  <Input
                    id="billingEmail"
                    name="email"
                    type="email"
                    value={billingAddress.email}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="billingPhone">Phone</Label>
                  <Input
                    id="billingPhone"
                    name="phone"
                    value={billingAddress.phone}
                    onChange={(e) => handleAddressChange(e, "billing")}
                    required={!useSameAddress}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="productSearch">Search Product</Label>
                <Input
                  id="productSearch"
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="border rounded-md mt-2 max-h-48 overflow-y-auto">
                    {searchResults.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-2 cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setSelectedProductVariant(variant); // Set the selected product variant
                          setSelectedSize(
                            variant.sizes.length > 0 ? variant.sizes[0] : ""
                          );
                          setSearchQuery(
                            `${variant.productName} - ${variant.color}`
                          );
                          setSearchResults([]);
                        }}
                      >
                        {variant.productName} - {variant.color} (Stock:{" "}
                        {variant.stock})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProductVariant && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="selectedVariant">Selected Variant</Label>
                    <Input
                      id="selectedVariant"
                      value={`${selectedProductVariant.productName} - ${selectedProductVariant.color}`}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) =>
                        setSelectedQuantity(parseInt(e.target.value))
                      }
                    />
                  </div>
                  {selectedProductVariant.sizes.length > 0 && (
                    <div>
                      <Label htmlFor="size">Size</Label>
                      <Select
                        value={selectedSize}
                        onValueChange={setSelectedSize}
                      >
                        <SelectTrigger id="size">
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProductVariant.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="col-span-full md:col-span-1"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
              )}
            </div>

            {orderItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Current Order Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary text-secondary-foreground">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {orderItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.color}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.selectedSize || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${item.priceAtPurchase.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {(item.quantity * item.priceAtPurchase).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right text-xl font-bold mt-4">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Order..." : "Create Order"}
        </Button>
      </form>
    </div>
  );
};

export default NewOrderPage;
