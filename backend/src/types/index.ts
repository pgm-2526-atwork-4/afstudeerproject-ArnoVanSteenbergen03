import { Express } from "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
      password: string;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}
