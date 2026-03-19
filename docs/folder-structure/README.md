# Folder Structure

## Top-Level Layout

```text
.
|- backend/
|- frontend/
|- shared/
|- README.md
|- ROUTING.md
|- netlify.toml
|- package.json
```

## Root Files

- `README.md`: project overview and setup
- `ROUTING.md`: API endpoint reference
- `package.json`: workspace configuration and root scripts
- `netlify.toml`: frontend deployment settings

## Backend Structure

```text
backend/
|- drizzle/
|  |- migrations/
|- src/
|  |- config/
|  |- db/
|  |- middleware/
|  |- routes/
|  |- services/
|  |- types/
|  |- index.ts
|  |- socket.ts
|- uploads/
|- drizzle.config.ts
|- package.json
|- tsconfig.json
```

### Key Backend Folders

- `src/config`: database and Passport configuration
- `src/db`: schema, seeding, and db utility scripts
- `src/middleware`: auth and permission middleware
- `src/routes`: feature-based API route modules
- `src/services`: reusable business logic utilities
- `uploads`: persisted uploaded files (profile and goods images)

## Frontend Structure

```text
frontend/
|- public/
|- src/
|  |- app/
|  |- components/
|  |- hooks/
|  |- lib/
|  |- types/
|- package.json
|- next.config.ts
|- tsconfig.json
```

### Key Frontend Folders

- `src/app`: Next.js App Router pages and route segments
- `src/components`: reusable UI and feature components
- `src/hooks`: custom React hooks (permissions, sockets, unread counts, etc.)
- `src/lib`: API clients and auth context
- `public`: static assets (images, icons, favicon files)

## Shared Structure

```text
shared/
|- schemas/
|- index.ts
|- package.json
```

### Key Shared Files

- `schemas/*.ts`: domain schemas (auth, users, orders, chat, etc.)
- `index.ts`: shared exports used by frontend and backend

## How to Navigate the Codebase Quickly

1. For an API behavior change: start in `backend/src/routes`, then check `backend/src/middleware`, then `shared/schemas`.
2. For a page or UI behavior change: start in `frontend/src/app`, then related `frontend/src/components`, then `frontend/src/lib`.
3. For payload or type mismatches: inspect `shared/schemas` first.
