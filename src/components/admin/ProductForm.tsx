"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@prisma/client";
import {
  getAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  ProductFormValues,
  ProductWithVariantsForForm,
  ProductApiPayload,
} from "@/lib/admin-api";
import ProductImagePicker from "./ProductImagePicker";

const AVAILABLE_SIZES = ["7", "8", "9", "10", "11", "12"];

// ✅ Available tag options
const AVAILABLE_TAGS = [
  { value: "new-arrival", label: "New Arrival" },
  { value: "trending", label: "Trending" },
  { value: "sale", label: "Sale" },
  { value: "limited-edition", label: "Limited Edition" },
  { value: "bestseller", label: "Best Seller" },
];

// ✅ Updated Zod schema with tags
const productVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, { message: "Color is required." }),
  images: z
    .array(z.string().url({ message: "Must be a valid URL." }))
    .min(1, { message: "At least one image is required." }),
  sizes: z
    .array(z.string())
    .min(1, { message: "At least one size is required." }),
  stock: z.number().min(0, { message: "Stock cannot be negative." }),
  tags: z.array(z.string()).optional(), // ✅ Variant-level tags
});

const productFormSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().optional(),
  price: z.number().min(0.01, { message: "Price must be a positive number." }),
  categoryIds: z
    .array(z.string())
    .min(1, { message: "At least one category is required." }),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(), // ✅ Product-level tags
  variants: z
    .array(productVariantSchema)
    .min(1, { message: "At least one product variant is required." }),
});

type ProductFormType = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: ProductWithVariantsForForm;
  productId?: string;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  productId,
  categories: initialCategories,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerVariantIndex, setImagePickerVariantIndex] = useState<
    number | null
  >(null);
  const [pendingUploads, setPendingUploads] = useState<{
    [key: string]: File[];
  }>({});

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? undefined,
          price: initialData.price,
          categoryIds: initialData.categories?.map((pc) => pc.categoryId) || [],
          featured: initialData.featured ?? false,
          tags: initialData.tags?.map((t) => t.tag) || [], // ✅ Load product tags
          variants: initialData.variants.map((variant) => ({
            id: variant.id,
            color: variant.color,
            images: JSON.parse(variant.images),
            sizes: JSON.parse(variant.sizes),
            stock: variant.stock,
            tags: variant.tags?.map((t) => t.tag) || [], // ✅ Load variant tags
          })),
        }
      : {
          name: "",
          description: "",
          price: 0.01,
          categoryIds: [],
          featured: false,
          tags: [], // ✅ Default empty tags
          variants: [
            {
              color: "",
              images: [],
              sizes: [],
              stock: 0,
              tags: [], // ✅ Default empty variant tags
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const currentImages = form.getValues(`variants.${variantIndex}.images`);
    const updatedImages = currentImages.filter(
      (_, index) => index !== imageIndex
    );
    form.setValue(`variants.${variantIndex}.images`, updatedImages, {
      shouldValidate: true,
    });
  };

  const handleNewImageUpload = (variantIndex: number, files: FileList) => {
    if (!files || files.length === 0) return;

    const key = `variant-${variantIndex}`;
    setPendingUploads((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...Array.from(files)],
    }));

    const fileUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    const currentImages =
      form.getValues(`variants.${variantIndex}.images`) || [];
    const updatedImages = [...currentImages, ...fileUrls];
    form.setValue(`variants.${variantIndex}.images`, updatedImages, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: ProductFormType) => {
    setIsSubmitting(true);

    try {
      // Upload pending files
      const uploadedImagesByVariant: { [key: string]: string[] } = {};

      for (const [key, files] of Object.entries(pendingUploads)) {
        if (files.length === 0) continue;

        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/admin/products/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error(`Failed to upload ${file.name}`);

          const data = await response.json();
          return data.imageUrl;
        });

        try {
          uploadedImagesByVariant[key] = await Promise.all(uploadPromises);
        } catch (error) {
          console.error(`Failed to upload images for ${key}:`, error);
          alert(`Failed to upload images for variant. Please try again.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Replace preview URLs with actual Cloudinary URLs
      const updatedValues = {
        ...values,
        variants: values.variants.map((variant, index) => {
          const currentImages = variant.images || [];
          const key = `variant-${index}`;
          const uploadedImages = uploadedImagesByVariant[key] || [];

          const finalImages = currentImages
            .filter((img) => !img.startsWith("blob:"))
            .concat(uploadedImages);

          return {
            ...variant,
            images: finalImages,
          };
        }),
      };

      // ✅ Prepare product data with tags
      const productData: ProductApiPayload = {
        ...updatedValues,
        featured: updatedValues.featured ?? false,
        tags: updatedValues.tags || [], // ✅ Include product tags
        variants: updatedValues.variants.map((variant) => ({
          id: variant.id,
          color: variant.color,
          images: JSON.stringify(variant.images),
          sizes: JSON.stringify(variant.sizes),
          stock: variant.stock,
          tags: variant.tags || [], // ✅ Include variant tags
        })),
      };

      if (productId) {
        await updateAdminProduct(productId, productData);
      } else {
        await createAdminProduct(productData);
      }

      setPendingUploads({});
      alert("Product saved successfully!");
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCategories) return <div>Loading categories...</div>;
  if (errorCategories)
    return (
      <div className="text-destructive">
        Error loading categories: {errorCategories}
      </div>
    );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                  }}
                  value={field.value === 0 ? "" : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormDescription>
                Select one or more categories for this product
              </FormDescription>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {categories.map((category) => {
                  const isSelected = field.value?.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        const currentValues = field.value || [];
                        const newValues = isSelected
                          ? currentValues.filter((id) => id !== category.id)
                          : [...currentValues, category.id];
                        field.onChange(newValues);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ Product-level Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Tags</FormLabel>
              <FormDescription>
                Select tags that apply to the entire product
              </FormDescription>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = field.value?.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => {
                        const currentValues = field.value || [];
                        const newValues = isSelected
                          ? currentValues.filter((t) => t !== tag.value)
                          : [...currentValues, tag.value];
                        field.onChange(newValues);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Variants Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Product Variants</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-6 rounded-md space-y-4 mb-6"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  {index === 0 ? "Base Variant" : `Variant ${index + 1}`}
                </h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove Variant
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`variants.${index}.color`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter color (e.g., Red, Blue)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${index}.images`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Images</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setImagePickerVariantIndex(index);
                              setIsImagePickerOpen(true);
                            }}
                            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors font-medium"
                          >
                            Choose from Library
                          </button>
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                handleNewImageUpload(index, e.target.files!)
                              }
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                (
                                  e.currentTarget.parentElement?.querySelector(
                                    'input[type="file"]'
                                  ) as HTMLInputElement
                                )?.click();
                              }}
                              className="w-full px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors font-medium"
                            >
                              Upload New
                            </button>
                          </label>
                        </div>
                      </div>
                    </FormControl>

                    {field.value && field.value.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-3">
                          Selected Images ({field.value.length}):
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {field.value.map((imageUrl, imageIndex) => (
                            <div
                              key={imageIndex}
                              className="relative group w-fit"
                            >
                              <img
                                src={imageUrl}
                                alt={`Variant ${index + 1} Image ${
                                  imageIndex + 1
                                }`}
                                className="h-24 w-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, imageIndex)}
                                className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${index}.sizes`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-4">
                      <FormLabel className="text-base">
                        Available Sizes
                      </FormLabel>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allSelected =
                              field.value?.length === AVAILABLE_SIZES.length &&
                              AVAILABLE_SIZES.every((size) =>
                                field.value?.includes(size)
                              );
                            field.onChange(allSelected ? [] : AVAILABLE_SIZES);
                          }}
                        >
                          {field.value?.length === AVAILABLE_SIZES.length &&
                          AVAILABLE_SIZES.every((size) =>
                            field.value?.includes(size)
                          )
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_SIZES.map((size) => (
                        <FormField
                          key={size}
                          control={form.control}
                          name={`variants.${index}.sizes`}
                          render={({ field: subField }) => {
                            return (
                              <FormItem
                                key={size}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={subField.value?.includes(size)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? subField.onChange([
                                            ...(subField.value || []),
                                            size,
                                          ])
                                        : subField.onChange(
                                            subField.value?.filter(
                                              (value) => value !== size
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {size}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${index}.stock`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter stock quantity, e.g., 20"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseInt(value) || 0
                          );
                        }}
                        value={field.value === 0 ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Variant-level Tags */}
              <FormField
                control={form.control}
                name={`variants.${index}.tags`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Tags</FormLabel>
                    <FormDescription>
                      Select tags specific to this color variant
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3">
                      {AVAILABLE_TAGS.filter(
                        (t) => t.value !== "bestseller"
                      ).map((tag) => {
                        const isSelected = field.value?.includes(tag.value);
                        return (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => {
                              const currentValues = field.value || [];
                              const newValues = isSelected
                                ? currentValues.filter((t) => t !== tag.value)
                                : [...currentValues, tag.value];
                              field.onChange(newValues);
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                color: "",
                images: [],
                sizes: [],
                stock: 0,
                tags: [], // ✅ Default empty tags for new variant
              })
            }
          >
            Add Another Variant
          </Button>
        </div>

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Product</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Mark this product as featured on the homepage.
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : productId
            ? "Update Product"
            : "Create Product"}
        </Button>

        {imagePickerVariantIndex !== null && (
          <ProductImagePicker
            isOpen={isImagePickerOpen}
            onClose={() => {
              setIsImagePickerOpen(false);
              setImagePickerVariantIndex(null);
            }}
            onSelect={(imageUrls) => {
              const currentImages =
                form.getValues(`variants.${imagePickerVariantIndex}.images`) ||
                [];
              const updatedImages = [...currentImages, ...imageUrls];
              form.setValue(
                `variants.${imagePickerVariantIndex}.images`,
                updatedImages,
                { shouldValidate: true }
              );
            }}
            selectedImages={
              imagePickerVariantIndex !== null
                ? form.getValues(`variants.${imagePickerVariantIndex}.images`)
                : []
            }
            multiSelect={true}
          />
        )}
      </form>
    </FormProvider>
  );
};

export default ProductForm;
