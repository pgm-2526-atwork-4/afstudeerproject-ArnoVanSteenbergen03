# Pick-Up-And-Give

Pick-Up-And-Give is a platform built together with Let's Save Food to manage food donations, pickups, deliveries, and distribution-center operations.

## Documentation

The project documentation is split into multiple sections:

- [Documentation Index](docs/README.md)
- [Tech Stack](docs/tech-stack/README.md)
- [Folder Structure](docs/folder-structure/README.md)
- [Routing Guide](docs/routing/README.md)
- [User Types and Visibility](docs/user-types/README.md)
- [API Endpoint Reference](ROUTING.md)

## Monorepo Overview

This repository uses npm workspaces and contains three packages:

- `backend`: Express API, authentication, authorization, business logic
- `frontend`: Next.js web application
- `shared`: shared Zod schemas and TypeScript types used by backend and frontend

## Quick Start

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pickup_and_give
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 3. Prepare the database

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 4. Run the app in development

Use two terminals:

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000`.

## Build

From the repository root:

```bash
npm run build:all
```

## About

This project focuses on reducing food waste by coordinating providers, volunteers, and administrators in one operational workflow.
