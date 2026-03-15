# API Routing Documentation

Complete reference of all available API endpoints.

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Application Routes](#application-routes)
- [Order Routes](#order-routes)
- [Delivery Routes](#delivery-routes)
- [Dashboard Routes](#dashboard-routes)
- [Distribution Center Routes](#distribution-center-routes)
- [Supplier Routes](#supplier-routes)
- [Vehicle Routes](#vehicle-routes)
- [Chat Routes](#chat-routes)
- [Profile Routes](#profile-routes)
- [Upload Routes](#upload-routes)

---

## Authentication Routes

**Base Path:** `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Check if user is authenticated |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Authenticate user and start session |
| GET | `/me` | Yes | Get current user profile and permissions |
| POST | `/logout` | Yes | End user session |

---

## User Routes

**Base Path:** `/users`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| POST | `/check-email` | Yes | `create_users` | Check if email is available |
| POST | `/` | Yes | `create_users` | Create a new user |
| GET | `/` | Yes | `read_users` | List all approved users |
| GET | `/:id` | Yes | `read_users` | Get user details by ID |
| PUT | `/:id` | Yes | `update_users` | Update user information |
| DELETE | `/:id` | Yes | `delete_users` | Delete user account |

**Query Parameters:**
- `GET /users?role=provider` - Filter users by role

---

## Application Routes

**Base Path:** `/applications`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/permissions` | Yes | `read_applications` | List all available permissions |
| GET | `/` | Yes | `read_applications` | List all user applications |
| GET | `/count` | Yes | `read_applications` | Get pending application count |
| POST | `/:id/approve` | Yes | `update_applications` | Approve a user application |
| POST | `/:id/deny` | Yes | `update_applications` | Deny a user application |

---

## Order Routes

**Base Path:** `/orders`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/lookups` | Yes | - | Get dropdown values for forms |
| POST | `/` | Yes | `create_activities` | Create a new order |
| GET | `/` | Yes | `read_activities` | Get all orders for current user |
| GET | `/:id` | Yes | `read_activities` | Get order details by ID |
| PUT | `/:id` | Yes | `update_activities` | Update order information |

**Query Parameters:**
- `GET /orders/lookups?type=category` - Get specific lookup type

---

## Delivery Routes

**Base Path:** `/deliveries`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/open` | Yes | `read_activities` | Get all unassigned deliveries |
| GET | `/mine` | Yes | `read_activities` | Get deliveries assigned to current user |
| GET | `/:id` | Yes | `read_activities` | Get delivery details by ID |
| PATCH | `/:id/accept` | Yes | `update_activities` | Accept and assign delivery to self |
| PATCH | `/:id/status` | Yes | `update_activities` | Update delivery progress status |

---

## Dashboard Routes

**Base Path:** `/dashboard`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | Yes | `read_activities` | Get paginated orders (admin view) |
| GET | `/:id` | Yes | `read_activities` | Get full order details (admin view) |
| PATCH | `/:id/assign-center` | Yes | `update_activities` | Assign order to distribution center |
| PUT | `/:id` | Yes | `update_activities` | Update order details |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status
- `centerId` - Filter by assigned center
- `dateFrom` - Filter by start date
- `dateTo` - Filter by end date

---

## Distribution Center Routes

**Base Path:** `/distribution-centers`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | Yes | `read_places` | Get all distribution centers |
| POST | `/` | Yes | `create_places` | Create a new distribution center |
| GET | `/:id` | Yes | `read_places` | Get distribution center by ID |
| PUT | `/:id` | Yes | `update_places` | Update distribution center information |
| DELETE | `/:id` | Yes | `delete_places` | Delete distribution center |

---

## Supplier Routes

**Base Path:** `/suppliers`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | Yes | `read_places` | Get all suppliers |
| POST | `/` | Yes | `create_places` | Create a new supplier |
| GET | `/:id` | Yes | `read_places` | Get supplier by ID |
| PUT | `/:id` | Yes | `update_places` | Update supplier information |
| DELETE | `/:id` | Yes | `delete_places` | Delete supplier |

---

## Vehicle Routes

**Base Path:** `/vehicles`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | No | - | Get all available vehicles |

---

## Chat Routes

**Base Path:** `/chat`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/channels` | Yes | - | Get all chat channels |
| POST | `/channels/community` | Yes | - | Get or create community channel |
| GET | `/channels/activity/:activityId` | Yes | - | Get channel for specific activity |
| GET | `/messages/:channelId` | Yes | - | Get messages from channel |
| POST | `/messages/:channelId` | Yes | - | Send message to channel |

**Query Parameters:**
- `limit` - Number of messages to fetch
- `before` - Message cursor for pagination

---

## Profile Routes

**Base Path:** `/profile`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | Yes | - | Get current user profile |
| PUT | `/` | Yes | - | Update current user profile |
| POST | `/image` | Yes | - | Upload profile image |

---

## Upload Routes

**Base Path:** `/upload`

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| POST | `/image` | Yes | - | Upload single image |
| POST | `/images` | Yes | - | Upload multiple images |

---

## Authentication & Authorization

### Session-based Authentication
- Uses Passport.js with local strategy
- Session cookies (connect.sid)
- Login at `/auth/login`, logout at `/auth/logout`

### Permission System
- Role-based access control via permissions
- Permissions granted when application is approved
- Available permissions include:
  - `create_activities` - Create orders/deliveries
  - `read_activities` - View orders/deliveries
  - `update_activities` - Update orders/deliveries
  - `read_users` - View user information
  - `create_users` - Create new users
  - `update_users` - Update user information
  - `delete_users` - Delete user accounts
  - `read_places` - View suppliers/distribution centers
  - `create_places` - Create suppliers/distribution centers
  - `update_places` - Update suppliers/distribution centers
  - `delete_places` - Delete suppliers/distribution centers
  - `read_applications` - View applications
  - `update_applications` - Approve/deny applications
