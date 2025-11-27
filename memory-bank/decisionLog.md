# Decision Log

This file records architectural and implementation decisions using a list format.
2025-08-28 05:10:04 - Log of updates made.

## Decision

**[2025-08-30] - Admin Product Management Architecture**

## Rationale

Implemented a comprehensive admin system for product management to replace manual database operations and provide a user-friendly interface for managing the product catalog.

## Implementation Details

**Database Schema Design:**

- Enhanced Product and ProductVariant models with proper relationships
- Maintained backward compatibility with existing cart and order systems
- Added comprehensive fields for SEO, inventory, and variant management

**API Architecture:**

- RESTful API design with consistent response patterns
- Bulk operations support for efficient management
- Proper error handling and validation at API level
- Image upload preparation with flexible storage backend support

**Frontend Architecture:**

- Component-based design using shadcn/ui for consistency
- Form validation with Zod for type safety
- Responsive design with dark theme support
- Separation of concerns between API client and UI components

**File Organization:**

- `admin-api.ts`: Centralized API client for all admin operations
- `components/admin/`: Admin-specific components with clear boundaries
- `components/ui/`: Reusable UI components following shadcn patterns
- Route-based organization for scalability

---

**Previous Decisions:**

**[2025-08-29 03:07:17] - Decision: Added `selectedSize: String?` field to `OrderItem` and `CartItem` Prisma models.**
Rationale: The previous implementation did not persist the user's selected size for individual cart or order items, leading to incorrect size display in order history (showing all available sizes instead of the chosen one). Storing `selectedSize` directly in these models ensures accurate historical data and correct display.
Implications: Required database migration, updates to client-side cart state management, server-side cart synchronization logic, order creation API, and order display API to correctly handle the new field.

**[2025-08-28 05:30:21] - Decision: Made `ProductVariant` the primary driver for the product details page, cart, and checkout process.**
Rationale: This provides a more scalable structure for handling products with multiple colors, sizes, and images. A flat product model was insufficient. This change required significant refactoring across the frontend state management (Zustand) and the backend API for cart synchronization to ensure the correct variant ID is tracked, not just the parent product ID.

## Next Architectural Decisions Needed

1. **Image Storage Strategy**: Need to decide between AWS S3, Cloudinary, or Vercel Blob for image storage
2. **Caching Strategy**: Determine Redis vs in-memory caching for product data
3. **Search Implementation**: Choose between database full-text search vs external search service (Algolia/Elasticsearch)
4. **State Management**: Evaluate if current Zustand setup scales for admin operations or if we need additional stores

[2025-08-31 19:39:47] - Corrected `categorySlug` mapping in `ProductForm.tsx` default values from `initialData.categoryId` to `initialData.category?.slug || ""`. This ensures the form field correctly uses the category slug for display and validation, aligning with the Zod schema's expectation.
[2025-08-31 19:39:47] - Modified `featured` field in `ProductForm.tsx` Zod schema from `z.boolean()` to `z.boolean().optional()`. This addresses type inference conflicts between `zodResolver` and `react-hook-form` regarding optional boolean fields.
[2025-08-31 19:39:47] - Implemented nullish coalescing (`?? false`) for the `featured` field in `ProductForm.tsx`'s `defaultValues` and `ProductApiPayload` construction. This guarantees `featured` is always a `boolean` value, resolving type incompatibility with the API payload and preventing runtime errors.

[2025-09-04 02:34:07] - Decision: Used Shadcn UI for `alert-dialog` component. Rationale: Consistency with existing UI components and ease of integration. Implications: Required manual creation of `alert-dialog.tsx` and installation of `@radix-ui/react-alert-dialog`.
[2025-09-04 02:34:07] - Decision: Used `date-fns` for date formatting. Rationale: Lightweight and widely used library for date manipulation. Implications: Required installation of `date-fns`.
[2025-09-04 02:34:07] - Decision: Implemented "ALL" as a specific string value for the "All Statuses" filter in the order list. Rationale: To avoid using an empty string as a `SelectItem` value, which caused a UI component error. Implications: Required adjustments to state management and API call logic to handle "ALL" as a special filter value.

[2025-09-05 23:44:30] - Modified `ProductForm.tsx` to correctly handle multiple image URLs from `CldUploadWidget`. The `onSuccess` callback was updated to process both single and array `result.info` structures, and `widget.close()` was moved from `onSuccess` to `onQueuesEnd` to prevent premature widget closure during multiple uploads. This resolved the issue where only one image was being saved/displayed after multiple uploads.

[2025-09-08 00:48:00] - Decision: Implemented new order creation functionality.
Rationale: To provide administrators with a UI to manually create orders, supporting both existing users and guest customers.
Implications: Required modifications to `src/app/(admin)/admin/orders/new/page.tsx` for the form, `src/app/api/admin/orders/route.ts` for the API endpoint, and debugging of client-side issues including `useToast` export, product search, size selection, and client-side navigation. The `Toaster` component was also created and integrated into `src/app/(admin)/layout.tsx`.

[2025-09-09 00:54:04] - Decision: Implemented core administrative user management system.
Rationale: To provide administrators with a UI and API to manage users, including viewing, searching, filtering, and deleting user accounts. This enhances the administrative capabilities of the platform.
Implementation Details:

- **User Data Model:** Extended `prisma/schema.prisma` to include `username` (unique), `status` (with `UserStatus` enum: `ACTIVE`, `INACTIVE`, `SUSPENDED`), and updated `UserRole` enum to `CUSTOMER` and `ADMIN`.
- **User Viewing (Read) with Search & Filtering:**
  - Created `src/app/api/admin/users/route.ts` API endpoint for fetching users with pagination, sorting, and comprehensive search/filter options (by `userId`, `username`, `email`, `role`, `status`).
  - Developed `src/app/(admin)/admin/users/page.tsx` frontend component, mirroring the existing order management layout, to display user data, integrate search/filter controls, and handle pagination/sorting.
- **User Deletion:**

  - Created `src/app/api/admin/users/[id]/route.ts` API endpoint for deleting users by `UserID`.
  - Implemented a security constraint to prevent an `ADMIN` from deleting their own account.
  - Integrated deletion functionality into `src/app/(admin)/admin/users/page.tsx` with `AlertDialog` for confirmation and `useToast` for feedback.
    [2025-09-23 07:50:00] - Decision: Implemented comprehensive user editing feature within the `admin/users` module.
    Rationale: To provide administrators with granular control over user accounts, enabling direct status modifications and detailed profile updates, enhancing administrative efficiency and platform security.
    Implementation Details:

- **Direct Status Update:**

  - Modified `src/app/(admin)/admin/users/page.tsx` to integrate a `Select` component for direct `UserStatus` modification within the user listing table.
  - Created `PATCH /api/admin/users/{id}/status` API endpoint in `src/app/api/admin/users/[id]/route.ts` to handle status-only updates with `UserStatusUpdateSchema` validation.
  - Implemented frontend logic for immediate UI reflection and confirmation via `AlertDialog`.

- **Detailed User Profile Editing:**
  - Created `src/app/(admin)/admin/users/[id]/edit/page.tsx` as a dedicated page for detailed user profile editing.
  - Added a `GET` handler to `src/app/api/admin/users/[id]/route.ts` to fetch individual user data for pre-populating the edit form.
  - Modified `src/components/admin/UserForm.tsx` to be reusable for both user creation and editing:
    - Accepts an optional `initialData` prop.
    - `password` field is optional for editing and not pre-filled.
    - `id` and `role` fields are displayed as non-editable.
    - Added an `addresses` field (as a JSON string `Textarea`) for editing.
    - `onSubmit` logic dynamically handles `POST` for creation and `PUT` for updates to `/api/admin/users/{id}`.
  - Implemented `PUT /api/admin/users/{id}` API endpoint in `src/app/api/admin/users/[id]/route.ts` with `UserUpdateSchema` for robust validation of `email`, `firstName`, `lastName`, `password` (optional), and `addresses`.
  - Ensured proper authorization checks (`verifyAuth` and `session.role !== "ADMIN"`) for all new and modified API endpoints.
