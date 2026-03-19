# Tech Stack

## Architecture Summary

Pick-Up-And-Give is a monorepo with three workspace packages:

- `frontend`: Next.js application
- `backend`: Express API server
- `shared`: shared validation schemas and types

The stack is TypeScript-first end-to-end, with shared contracts between frontend and backend.

## Frontend Stack

### Core Framework

- Next.js 16 (App Router)
- React 19
- TypeScript 5

### UI and Styling

- Tailwind CSS 4
- shadcn and Radix UI primitives
- Lucide icons
- Utility helpers: `clsx`, `class-variance-authority`, `tailwind-merge`

### State, Forms, and Data Fetching

- React Context for authentication state
- TanStack React Query (installed for async data workflows)
- React Hook Form + Zod resolvers

### Specialized Frontend Libraries

- Socket.IO client for real-time chat
- `maplibre-gl` + `react-map-gl` for map features
- `@dnd-kit` for drag-and-drop interactions

## Backend Stack

### Core Framework

- Express 5
- TypeScript 5
- Node.js runtime

### Authentication and Sessions

- Passport (local strategy)
- `express-session`
- `connect-pg-simple` for PostgreSQL-backed session storage
- `bcrypt` for password hashing

### Database and Data Access

- PostgreSQL
- Drizzle ORM
- Drizzle Kit for migrations and schema generation

### Validation and Uploads

- Zod for runtime validation
- Multer for file uploads

### Real-Time Communication

- Socket.IO on top of the Express HTTP server

## Shared Package

The `shared` workspace centralizes contracts used by both apps:

- Zod schemas for auth, orders, users, profile, vehicles, chat, and more
- TypeScript types inferred from schemas

This keeps API payload shapes consistent across backend and frontend.

## Tooling and Build

- npm workspaces at repository root
- TypeScript compiler and path alias tooling (`tsc-alias`, `tsconfig-paths`)
- ESLint in frontend

## Deployment Notes

- Frontend includes `netlify.toml` with Next.js build settings.
- Backend is configured for secure cookies and cross-origin sessions, with environment-driven configuration.

## Required Environment Variables

### Backend

- `DATABASE_URL`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `PORT` (optional, defaults to `5000`)

### Frontend

- `NEXT_PUBLIC_API_BASE_URL` (for example: `http://localhost:5000/api`)
