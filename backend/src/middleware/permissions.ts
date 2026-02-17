import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { permissions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const checkCapability = (requiredCapability: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = await db.query.permissions.findMany({
      where: eq(permissions.userId, (req.user as any).id),
    });

    const hasCapability = userPermissions.some(
      (p) => p.capability === requiredCapability
    );

    if (!hasCapability) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};