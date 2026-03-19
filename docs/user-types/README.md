# User Types and What Each User Sees

## Access Model

Access is permission-driven, not only role-driven.

The backend and frontend enforce access through:

- authentication (logged in)
- approval status (`isApproved`)
- permission keys (for example `view_orders`, `update_users`, `read_applications`)

Page visibility in navigation is mainly controlled by `view_*` permissions, while create/read/update/delete behavior is controlled by resource permissions.

## How Users Enter the System

### Self-registration

Users can self-register as:

- `provider`
- `volunteer`

After registration they are routed to `/pending` until an admin approves their application.

### Admin-created Users

Users created from the admin user management flow can be:

- `admin`
- `manager`
- `provider`
- `volunteer`

These users can be created directly as approved with custom permission sets.

## Primary User Types

| User Type | Approval Required | Typical Navigation | Typical Screens and Capabilities |
|---|---|---|---|
| Admin | No (treated as approved) | Dashboard, Orders, Chat, Account | Full access. Manages users, applications, suppliers, distribution centers, orders, and chat membership. |
| Manager | Usually pre-approved/admin-created | Dashboard, Orders, Chat, Account | Operational management with mostly read/update capabilities. In seeded defaults: read-only user page, supplier and distribution-center visibility, order management, chat member management. |
| Provider | Yes (when self-registered) | Orders, Chat, Account | Creates and manages own orders, updates own profile, can manage own supplier details from profile. |
| Volunteer | Yes (when self-registered) | Deliveries, Chat, Account | Views open deliveries, accepts deliveries, updates delivery status, communicates through chat channels. |
| Pending User | Not yet approved | Pending page only | Sees pending-approval screen and can log out; no operational pages until approved. |

## What Each Role Sees in Practice

### Admin

- Dashboard cards for orders, suppliers, distribution centers, and users (based on permissions)
- User management and permissions assignment
- Application approval/denial flow
- Ability to add/remove users in chat channels (`manage_chat_members`)

### Manager

- Dashboard-based operational tools
- Manage orders and monitor logistics
- View users and related admin pages if granted `view_*` permissions
- In seeded defaults, cannot approve applications unless explicitly granted application permissions

### Provider

- Order-focused workflow (create, edit, monitor own orders)
- Chat channels relevant to supplier/order communication
- Profile editing and supplier management block in profile

### Volunteer

- Delivery-focused workflow (open deliveries, my deliveries, status transitions)
- Chat channels for coordination and support
- Profile editing

## Permission Notes

- Role labels are useful, but final access is defined by permission keys attached to each user.
- The default seeded permissions are a starting point; admins can customize permissions during approval or user creation.
- A database-level value for `centerManager` exists in schema comments, but the current registration/admin creation flows actively use `admin`, `manager`, `provider`, and `volunteer`.
