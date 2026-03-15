import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { places, channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";
import { distributionCenterSchema } from "@shared/index";

const router = Router();

// Get all distribution centers
router.get(
  "/",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const allCenters = await db
        .select()
        .from(places)
        .where(eq(places.type, "distribution_center"));
      res.json(allCenters);
    } catch (error) {
      console.error("Fetch distribution centers error:", error);
      res.status(500).json({ error: "Failed to fetch distribution centers" });
    }
  },
);

// Create distribution center
router.post(
  "/",
  requirePermission("create_places"),
  async (req: Request, res: Response) => {
    try {
      const validated = distributionCenterSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .parse(req.body);

      const [newCenter] = await db
        .insert(places)
        .values({
          name: validated.name,
          type: validated.type,
          geojson: validated.geojson,
          operatingInfo: validated.operatingInfo || null,
          contactInfo: validated.contactInfo || null,
        })
        .returning();

      // Auto-create a channel for this distribution center
      await db.insert(channels).values({
        name: `${newCenter.name} - Distro`,
        type: "distribution_center",
        placeId: newCenter.id,
      });

      res.status(201).json(newCenter);
    } catch (error) {
      console.error("Create distribution center error:", error);
      res.status(500).json({ error: "Failed to create distribution center" });
    }
  },
);

// Get distribution center by ID
router.get(
  "/:id",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [center] = await db
        .select()
        .from(places)
        .where(eq(places.id, id));

      if (!center) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      res.json(center);
    } catch (error) {
      console.error("Fetch distribution center error:", error);
      res.status(500).json({ error: "Failed to fetch distribution center" });
    }
  },
);

// Update distribution center
router.put(
  "/:id",
  requirePermission("update_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [center] = await db
        .select()
        .from(places)
        .where(eq(places.id, id));

      if (!center) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      const validated = distributionCenterSchema.partial().parse(req.body);

      const [updated] = await db
        .update(places)
        .set({
          ...(validated.name && { name: validated.name }),
          ...(validated.type && { type: validated.type }),
          ...(validated.geojson && { geojson: validated.geojson }),
          ...(validated.operatingInfo && { operatingInfo: validated.operatingInfo }),
          ...(validated.contactInfo && { contactInfo: validated.contactInfo }),
          updatedAt: new Date(),
        })
        .where(eq(places.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update distribution center error:", error);
      res.status(500).json({
        error: "Failed to update distribution center",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Delete distribution center
router.delete(
  "/:id",
  requirePermission("delete_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [center] = await db
        .select()
        .from(places)
        .where(eq(places.id, id));

      if (!center) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      await db.delete(places).where(eq(places.id, id));
      res.json({ message: "Distribution center deleted successfully" });
    } catch (error) {
      console.error("Delete distribution center error:", error);
      res.status(500).json({ error: "Failed to delete distribution center" });
    }
  },
);

export default router;
