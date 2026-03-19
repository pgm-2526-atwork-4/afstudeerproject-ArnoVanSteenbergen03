# Routing Guide

This file explains how routing is organized in the app. The full endpoint list is documented in [ROUTING.md](../../ROUTING.md).

## Backend API Routing

All backend routes are mounted in `backend/src/index.ts` under the `/api` prefix.

### Mounted API Modules

- `/api/auth`
- `/api/upload`
- `/api/chat`
- `/api/profile`
- `/api/orders`
- `/api/dashboard`
- `/api/deliveries`
- `/api/applications`
- `/api/users`
- `/api/distribution-centers`
- `/api/suppliers`
- `/api/vehicles`

### Routing Pattern

The backend uses feature-based route files in `backend/src/routes`.

Each route module typically combines:

- authentication guard (`requireAuth`)
- approval guard (`requireApproved` where relevant)
- permission guard (`requirePermission("...")`)

## Frontend Routing

The frontend uses Next.js App Router in `frontend/src/app`.

### Public Routes

- `/`
- `/login`
- `/register`

### Protected Route Families

- `/dashboard`
- `/orders`
- `/create-order`
- `/edit-order/[id]`
- `/deliveries`
- `/manage-orders`
- `/manage-orders/[id]/edit`
- `/suppliers`
- `/distribution-centers`
- `/users`
- `/applications`
- `/chatroom`
- `/profile`
- `/pending` (authenticated but not yet approved)

Page protection is handled through the `ProtectedPage` component, which checks login, approval state, and permission requirements.

## Authorization Routing Behavior

- Not authenticated: redirected to `/login`
- Authenticated but not approved: redirected to `/pending`
- Authenticated and approved but missing permission: redirected to `/dashboard` (or role fallback)

## Where to Update Routing Docs

When route behavior changes:

1. Update backend or frontend route implementation.
2. Update this guide if architecture/mounting changes.
3. Update [ROUTING.md](../../ROUTING.md) for endpoint-level contract changes.
