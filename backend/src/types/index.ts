import { Express } from "express";
declare global {
  namespace Express {
    interface User {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      username: string;
      password: string;
      userType: string;
      isApproved: boolean;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}
