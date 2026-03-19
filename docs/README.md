# Documentation Index

Complete guides for developers working on Pick-Up-And-Give.

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

### 5. Build for production

From the repository root:

```bash
npm run build:all
```

## Documentation Sections

- [Tech Stack](tech-stack/README.md) – Framework, libraries, and tooling
- [Folder Structure](folder-structure/README.md) – Codebase organization and conventions
- [Routing Guide](routing/README.md) – Backend API and frontend page routing
- [User Types and Visibility](user-types/README.md) – Roles, permissions, and page access
- [API Endpoint Reference](../ROUTING.md) – Full endpoint documentation

## Recommended Reading Order

1. [Tech Stack](tech-stack/README.md)
2. [Folder Structure](folder-structure/README.md)
3. [Routing Guide](routing/README.md)
4. [User Types and Visibility](user-types/README.md)

## Documentation Maintenance

- Update the relevant section when behavior changes.
- Keep [ROUTING.md](../ROUTING.md) in sync with backend route changes.
- Keep the user-role matrix aligned with real permissions and page guards.
