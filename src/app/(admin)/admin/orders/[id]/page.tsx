"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Order,
  OrderItem,
  ProductVariant,
  Product,
  OrderStatus,
} from "@prisma/client";
import { format } from "date-fns";
import { ArrowLeft, Save, PlusCircle, MinusCircle } from "lucide-react";
import { Address } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

interface OrderDetail extends Order {
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  orderItems: (OrderItem & {
    productVariant: ProductVariant & {
      product: Product;
    };
  })[];
}

// Define Zod schema for Address
const AddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

// Define Zod schema for OrderItem
const OrderItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  productVariantId: z.string().min(1, "Product variant is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0.01, "Price must be positive"),
  selectedSize: z.string().optional(),
});

// Define Zod schema for the entire Order update payload
const OrderUpdateSchema = z.object({
  guestEmail: z
    .string()
    .email("Invalid guest email")
    .optional()
    .or(z.literal("")),
  status: z.nativeEnum(OrderStatus),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentIntentId: z.string().optional().or(z.literal("")),
  orderItems: z.array(OrderItemSchema),
});

type EditableOrder = z.infer<typeof OrderUpdateSchema> & {
  id: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  total: number; // This will be calculated on the backend
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [editableOrder, setEditableOrder] = useState<EditableOrder | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data: OrderDetail = await response.json();
      setOrder(data);

      // Initialize editable order state
      const shippingAddressParsed =
        typeof data.shippingAddress === "string"
          ? JSON.parse(data.shippingAddress)
          : data.shippingAddress;
      const billingAddressParsed = data.billingAddress
        ? typeof data.billingAddress === "string"
          ? JSON.parse(data.billingAddress)
          : data.billingAddress
        : undefined;

      setEditableOrder({
        id: data.id,
        userId: data.userId,
        guestEmail: data.guestEmail || "",
        status: data.status,
        total: data.total,
        shippingAddress: shippingAddressParsed,
        billingAddress: billingAddressParsed,
        paymentIntentId: data.paymentIntentId || "",
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        orderItems: data.orderItems.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize || undefined,
        })),
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to fetch order details:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => {
      if (!prev) return null;

      // Prevent handleInputChange from updating status, as it's handled by Select's onValueChange
      if (name === "status") {
        return prev;
      }

      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        if (parent === "shippingAddress" || parent === "billingAddress") {
          const currentAddress = (prev[parent] || {}) as Address;
          return {
            ...prev,
            [parent]: {
              ...currentAddress,
              [child]: value,
            },
          };
        }
        // If it's not an address, it should be a top-level property
        return { ...prev, [name]: value };
      }
      return { ...prev, [name]: value }; // Remove the duplicate line below this
    });
  };

  const handleAddressChange = (
    addressType: "shippingAddress" | "billingAddress",
    field: keyof Address,
    value: string
  ) => {
    setEditableOrder((prev) => {
      if (!prev) return null;

      const currentAddress: Address = {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        email: "",
        phone: "",
        ...(prev[addressType] || {}),
      };

      return {
        ...prev,
        [addressType]: {
          ...currentAddress,
          [field]: value,
        },
      };
    });
  };

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setEditableOrder((prev) => {
      if (!prev) return null;
      const newOrderItems = [...prev.orderItems];
      // Ensure type safety for order item updates
      if (field === "quantity") {
        newOrderItems[index].quantity = value as number;
      } else if (field === "price") {
        newOrderItems[index].price = value as number;
      } else if (field === "productVariantId") {
        newOrderItems[index].productVariantId = value as string;
      } else if (field === "selectedSize") {
        newOrderItems[index].selectedSize = value as string | undefined;
      }
      return { ...prev, orderItems: newOrderItems };
    });
  };

  const handleAddOrderItem = () => {
    setEditableOrder((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        orderItems: [
          ...prev.orderItems,
          {
            productVariantId: "", // Needs to be selected
            quantity: 1,
            price: 0,
            selectedSize: "",
          },
        ],
      };
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    setEditableOrder((prev) => {
      if (!prev) return null;
      const newOrderItems = [...prev.orderItems];
      newOrderItems.splice(index, 1);
      return { ...prev, orderItems: newOrderItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableOrder) return;

    setIsSaving(true);
    setFormErrors([]);

    try {
      const validatedData = OrderUpdateSchema.parse({
        guestEmail: editableOrder.guestEmail,
        status: editableOrder.status,
        shippingAddress: editableOrder.shippingAddress,
        billingAddress: editableOrder.billingAddress,
        paymentIntentId: editableOrder.paymentIntentId,
        orderItems: editableOrder.orderItems,
      });

      const payload = {
        ...validatedData,
        shippingAddress: JSON.stringify(validatedData.shippingAddress),
        billingAddress: validatedData.billingAddress
          ? JSON.stringify(validatedData.billingAddress)
          : null,
      };

      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      toast({
        title: "Success",
        description: "Order updated successfully!",
      });
      fetchOrder(); // Re-fetch to get the latest data and clear dirty state
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setFormErrors(err.issues);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        });
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Failed to update order:", err);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getErrorMessage = (path: string) => {
    const error = formErrors.find((e) => e.path.join(".") === path);
    return error ? error.message : null;
  };

  if (loading) {
    return <div className="p-6">Loading order details...</div>;
  }

  if (!order || !editableOrder) {
    return <div className="p-6">Order not found or failed to load.</div>;
  }

  const customerName = order.user
    ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() ||
      order.user.email
    : editableOrder.guestEmail || "N/A";

  return (
    <div className="p-6 space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <h1 className="text-3xl font-bold">Edit Order: {order.id}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.userId ? (
              <>
                <p>
                  <strong>Name:</strong> {customerName}
                </p>
                <p>
                  <strong>Email:</strong> {order.user?.email}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  name="guestEmail"
                  type="email"
                  value={editableOrder.guestEmail}
                  onChange={handleInputChange}
                />
                {getErrorMessage("guestEmail") && (
                  <p className="text-red-500 text-sm">
                    {getErrorMessage("guestEmail")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editableOrder.status}
                onValueChange={(value: OrderStatus) =>
                  setEditableOrder((prev) =>
                    prev ? { ...prev, status: value } : null
                  )
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("status") && (
                <p className="text-red-500 text-sm">
                  {getErrorMessage("status")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total Amount</Label>
              <Input
                id="total"
                name="total"
                type="number"
                step="0.01"
                value={editableOrder.total.toFixed(2)}
                readOnly // Total is calculated, not directly editable
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentIntentId">Payment Intent ID</Label>
              <Input
                id="paymentIntentId"
                name="paymentIntentId"
                value={editableOrder.paymentIntentId}
                onChange={handleInputChange}
              />
              {getErrorMessage("paymentIntentId") && (
                <p className="text-red-500 text-sm">
                  {getErrorMessage("paymentIntentId")}
                </p>
              )}
            </div>
            <p>
              <strong>Order Date:</strong>{" "}
              {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressForm
              address={editableOrder.shippingAddress}
              onAddressChange={(field, value) =>
                handleAddressChange("shippingAddress", field, value)
              }
              errors={formErrors}
              pathPrefix="shippingAddress"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Details (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editableOrder.billingAddress ? (
              <AddressForm
                address={editableOrder.billingAddress}
                onAddressChange={(field, value) =>
                  handleAddressChange("billingAddress", field, value)
                }
                errors={formErrors}
                pathPrefix="billingAddress"
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditableOrder((prev) =>
                    prev
                      ? {
                          ...prev,
                          billingAddress: {
                            firstName: "",
                            lastName: "",
                            address: "",
                            city: "",
                            state: "",
                            zipCode: "",
                            country: "",
                            email: "",
                            phone: "",
                          },
                        }
                      : null
                  )
                }
              >
                Add Billing Address
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editableOrder.orderItems.map((item, index) => (
              <div
                key={item.id || `new-item-${index}`}
                className="border p-4 rounded-md space-y-2 relative"
              >
                <h3 className="font-semibold">Item #{index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-variant`}>
                      Product Variant ID
                    </Label>
                    <Input
                      id={`item-${index}-variant`}
                      value={item.productVariantId}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "productVariantId",
                          e.target.value
                        )
                      }
                    />
                    {getErrorMessage(
                      `orderItems.${index}.productVariantId`
                    ) && (
                      <p className="text-red-500 text-sm">
                        {getErrorMessage(
                          `orderItems.${index}.productVariantId`
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    {getErrorMessage(`orderItems.${index}.quantity`) && (
                      <p className="text-red-500 text-sm">
                        {getErrorMessage(`orderItems.${index}.quantity`)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-price`}>Price</Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "price",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    {getErrorMessage(`orderItems.${index}.price`) && (
                      <p className="text-red-500 text-sm">
                        {getErrorMessage(`orderItems.${index}.price`)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-size`}>Selected Size</Label>
                    <Input
                      id={`item-${index}-size`}
                      value={item.selectedSize || ""}
                      onChange={(e) =>
                        handleOrderItemChange(
                          index,
                          "selectedSize",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveOrderItem(index)}
                  className="absolute top-2 right-2"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddOrderItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Order Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />{" "}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

interface AddressFormProps {
  address: Address;
  onAddressChange: (field: keyof Address, value: string) => void;
  errors: z.ZodIssue[];
  pathPrefix: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onAddressChange,
  errors,
  pathPrefix,
}) => {
  const getAddressErrorMessage = (field: keyof Address) => {
    const error = errors.find(
      (e) => e.path.join(".") === `${pathPrefix}.${field}`
    );
    return error ? error.message : null;
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-firstName`}>First Name</Label>
        <Input
          id={`${pathPrefix}-firstName`}
          value={address.firstName}
          onChange={(e) => onAddressChange("firstName", e.target.value)}
        />
        {getAddressErrorMessage("firstName") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("firstName")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-lastName`}>Last Name</Label>
        <Input
          id={`${pathPrefix}-lastName`}
          value={address.lastName}
          onChange={(e) => onAddressChange("lastName", e.target.value)}
        />
        {getAddressErrorMessage("lastName") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("lastName")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-address`}>Address</Label>
        <Input
          id={`${pathPrefix}-address`}
          value={address.address}
          onChange={(e) => onAddressChange("address", e.target.value)}
        />
        {getAddressErrorMessage("address") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("address")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-city`}>City</Label>
        <Input
          id={`${pathPrefix}-city`}
          value={address.city}
          onChange={(e) => onAddressChange("city", e.target.value)}
        />
        {getAddressErrorMessage("city") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("city")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-state`}>State</Label>
        <Input
          id={`${pathPrefix}-state`}
          value={address.state}
          onChange={(e) => onAddressChange("state", e.target.value)}
        />
        {getAddressErrorMessage("state") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("state")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-zipCode`}>Zip Code</Label>
        <Input
          id={`${pathPrefix}-zipCode`}
          value={address.zipCode}
          onChange={(e) => onAddressChange("zipCode", e.target.value)}
        />
        {getAddressErrorMessage("zipCode") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("zipCode")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-country`}>Country</Label>
        <Input
          id={`${pathPrefix}-country`}
          value={address.country}
          onChange={(e) => onAddressChange("country", e.target.value)}
        />
        {getAddressErrorMessage("country") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("country")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-email`}>Email</Label>
        <Input
          id={`${pathPrefix}-email`}
          type="email"
          value={address.email}
          onChange={(e) => onAddressChange("email", e.target.value)}
        />
        {getAddressErrorMessage("email") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("email")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${pathPrefix}-phone`}>Phone</Label>
        <Input
          id={`${pathPrefix}-phone`}
          value={address.phone}
          onChange={(e) => onAddressChange("phone", e.target.value)}
        />
        {getAddressErrorMessage("phone") && (
          <p className="text-red-500 text-sm">
            {getAddressErrorMessage("phone")}
          </p>
        )}
      </div>
    </>
  );
};

export default OrderDetailPage;
