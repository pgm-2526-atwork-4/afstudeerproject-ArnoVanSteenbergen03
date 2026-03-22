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

## Permission Table (All Current Permission Keys)

The system seeds permissions as CRUD keys on core resources, plus page-visibility keys and one special admin key.

### Resource Permissions (CRUD)

| Permission Key | Allows This Action |
|---|---|
| `create_activities` | Create activities (used for creating orders/delivery activities). |
| `read_activities` | View/list activity records (orders, deliveries, activity details). |
| `update_activities` | Update activity state/details (status transitions, assignment, updates). |
| `delete_activities` | Delete activity records. |
| `create_places` | Create place records (supplier/distribution center locations). |
| `read_places` | View/list place records. |
| `update_places` | Edit place records. |
| `delete_places` | Delete place records. |
| `create_food_items` | Create food/goods items linked to activities. |
| `read_food_items` | View/list food/goods items. |
| `update_food_items` | Edit food/goods items. |
| `delete_food_items` | Delete food/goods items. |
| `create_vehicles` | Create vehicle records. |
| `read_vehicles` | View/list vehicle records. |
| `update_vehicles` | Edit vehicle records. |
| `delete_vehicles` | Delete vehicle records. |
| `create_users` | Create user accounts. |
| `read_users` | View/list user accounts. |
| `update_users` | Edit user accounts and user-related details. |
| `delete_users` | Delete user accounts. |
| `create_applications` | Create application records. |
| `read_applications` | View/list registration applications. |
| `update_applications` | Review and update application status (for example approve/deny). |
| `delete_applications` | Delete application records. |
| `create_channels` | Create chat channels. |
| `read_channels` | View/list chat channels. |
| `update_channels` | Edit chat channel details. |
| `delete_channels` | Delete chat channels. |

### Page Visibility Permissions (`view_*`)

| Permission Key | Allows This Action |
|---|---|
| `view_dashboard` | Show/access dashboard page navigation and dashboard screen. |
| `view_orders` | Show/access orders page navigation and order workflow screens. |
| `view_deliveries` | Show/access deliveries page navigation and delivery workflow screens. |
| `view_chatroom` | Show/access chatroom navigation and chat screen. |
| `view_profile` | Show/access account/profile page navigation and profile screen. |
| `view_users` | Show/access users management page navigation and screen. |
| `view_suppliers` | Show/access suppliers page navigation and screen. |
| `view_distribution_centers` | Show/access distribution centers page navigation and screen. |

### Special Permissions

| Permission Key | Allows This Action |
|---|---|
| `manage_chat_members` | Add/remove users in chat channels and manage channel membership. |

## Permission Notes

- Role labels are useful, but final access is defined by permission keys attached to each user.
- The default seeded permissions are a starting point; admins can customize permissions during approval or user creation.
- A database-level value for `centerManager` exists in schema comments, but the current registration/admin creation flows actively use `admin`, `manager`, `provider`, and `volunteer`.
