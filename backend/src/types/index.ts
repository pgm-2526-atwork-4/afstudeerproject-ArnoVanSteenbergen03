import { Express } from "express";

// This augments Express.User so req.user is properly typed in the backend.
// These fields match the "users" table in db/schema.ts.
declare global {
  namespace Express {
    interface User {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      username: string;
      password: string;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}
