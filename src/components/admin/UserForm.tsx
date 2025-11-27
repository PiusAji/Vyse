"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormProvider } from "react-hook-form";
import { User, UserRole } from "@prisma/client";

// Define the address structure type
interface AddressType {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .optional()
    .or(z.literal("")),
  firstName: z
    .string()
    .min(1, { message: "First name is required." })
    .max(50, { message: "First name must be less than 50 characters." }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required." })
    .max(50, { message: "Last name must be less than 50 characters." }),
  role: z.enum([UserRole.ADMIN, UserRole.CUSTOMER], {
    message: "You need to select a role.",
  }),
  // Address fields
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData?: User;
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely get address data - memoized to prevent re-renders
  const getAddressField = useCallback(
    (field: keyof AddressType): string => {
      if (
        !initialData?.addresses ||
        !Array.isArray(initialData.addresses) ||
        initialData.addresses.length === 0
      ) {
        return "";
      }
      const firstAddress = initialData.addresses[0] as AddressType;
      return firstAddress[field] || "";
    },
    [initialData?.addresses]
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      password: "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      role: initialData?.role || UserRole.CUSTOMER,
      street: getAddressField("street"),
      city: getAddressField("city"),
      state: getAddressField("state"),
      zipCode: getAddressField("zipCode"),
      country: getAddressField("country"),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        role: initialData.role,
        street: getAddressField("street"),
        city: getAddressField("city"),
        state: getAddressField("state"),
        zipCode: getAddressField("zipCode"),
        country: getAddressField("country"),
        password: "",
      });
    }
  }, [initialData, form, getAddressField]);

  async function onSubmit(values: UserFormValues) {
    setIsLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/admin/users/${initialData.id}`
        : "/api/admin/users";

      // Build address object from individual fields
      const addressObject = {
        street: values.street || "",
        city: values.city || "",
        state: values.state || "",
        zipCode: values.zipCode || "",
        country: values.country || "",
      };

      // Only include address if at least one field has a value
      const hasAddressData = Object.values(addressObject).some(
        (value) => value.trim() !== ""
      );

      // Build payload with proper typing
      const payload: {
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        addresses: string;
        password?: string;
      } = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        addresses: hasAddressData ? JSON.stringify([addressObject]) : "[]",
      };

      // Add password only if provided
      if (values.password && values.password.trim() !== "") {
        payload.password = values.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${initialData ? "update" : "create"} user.`
        );
      }

      toast({
        title: "Success!",
        description: `User ${
          initialData ? "updated" : "created"
        } successfully.`,
      });

      if (!initialData) {
        // Reset form to clear all fields only for creation
        form.reset({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: UserRole.CUSTOMER,
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        });
      }

      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error: unknown) {
      console.error(
        `User ${initialData ? "update" : "creation"} error:`,
        error
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? `Edit User: ${initialData.email}` : "Create New User"}
      </h2>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
        >
          {initialData && (
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={initialData.id}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter email"
                    type="email"
                    autoComplete="new-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!initialData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {initialData && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      New Password (leave empty to keep current)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!initialData} // Disable role editing for existing users
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state or province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter ZIP or postal code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? initialData
                ? "Updating User..."
                : "Creating User..."
              : initialData
              ? "Update User"
              : "Create User"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
