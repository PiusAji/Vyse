# System Patterns _Optional_

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-08-28 05:10:15 - Log of updates made.

-

## Coding Patterns

-

## Architectural Patterns

-

## Testing Patterns

-

[2025-08-28 05:30:57] - Implemented a full-stack feature based on the established pattern: The frontend component (`ProductDetails.tsx`) manages UI state (selected color/size) and passes a specific `productVariantId` to the Zustand store (`cart-store.ts`). The store then triggers a synchronization with the backend (`/api/cart/sync`) which updates the user's cart in the database based on the `productVariantId`. This reinforces the pattern of client-side state driving backend persistence through a dedicated API route.
