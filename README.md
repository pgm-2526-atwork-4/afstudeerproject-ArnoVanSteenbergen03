# Pick-Up-And-Give

Pick-Up-And-Give is a platform built together with Let's Save Food to manage food donations, pickups, deliveries, and distribution-center operations.

The app coordinates **providers** (restaurants, stores), **volunteers** (delivery drivers), and **administrators** in a unified workflow to reduce food waste and ensure timely delivery of donations.

## Getting Started

### Development Setup

From the repository root:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

For detailed setup and environment configuration, see [Quick Start Guide](docs/README.md).

## Documentation

- [Tech Stack](docs/tech-stack/README.md) – Frontend, backend, and database technologies
- [Folder Structure](docs/folder-structure/README.md) – Codebase organization
- [Routing Guide](docs/routing/README.md) – Backend API and frontend page routing
- [User Types and Visibility](docs/user-types/README.md) – Roles, permissions, and access control
- [API Endpoint Reference](ROUTING.md) – Full endpoint documentation

## Project Structure

This is an npm monorepo with three packages:

- **`backend`** – Express API, authentication, business logic
- **`frontend`** – Next.js web application
- **`shared`** – Zod schemas and TypeScript types

## About

This project focuses on reducing food waste by coordinating food providers, volunteers, and administrators in one operational workflow. Built with Let's Save Food.
