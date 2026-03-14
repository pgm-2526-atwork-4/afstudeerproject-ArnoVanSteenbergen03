import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { places, channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";
import { distributionCenterSchema } from "@shared/index";

const router = Router();

// get all distribution centers
router.get(
  "/",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const allPlaces = await db.query.places.findMany({
        where: eq(places.type, "distribution_center"),
      });
      res.json(allPlaces);
    } catch (error) {
      console.error("Fetch places error:", error);
      res.status(500).json({ error: "Failed to fetch distribution centers" });
    }
  },
);

// create new distribution center
router.post(
  "/",
  requirePermission("create_places"),
  async (req: Request, res: Response) => {
    try {
      const validated = distributionCenterSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);

      const newPlace = await db
        .insert(places)
        .values({
          name: validated.name,
          type: validated.type,
          geojson: validated.geojson,
          operatingInfo: validated.operatingInfo || null,
          contactInfo: validated.contactInfo || null,
        })
        .returning();

      // Auto-create a distro channel for this distribution center
      await db.insert(channels).values({
        name: `${newPlace[0].name} - Distro`,
        type: "distribution_center",
        placeId: newPlace[0].id,
      });

      res.status(201).json(newPlace[0]);
    } catch (error) {
      console.error("Create place error:", error);
      res.status(500).json({ error: "Failed to create distribution center" });
    }
  },
);

// get single distribution center
router.get(
  "/:id",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const place = await db.query.places.findFirst({
        where: eq(places.id, id),
      });

      if (!place) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      res.json(place);
    } catch (error) {
      console.error("Fetch place error:", error);
      res.status(500).json({ error: "Failed to fetch distribution center" });
    }
  },
);

// update distribution center
router.put(
  "/:id",
  requirePermission("update_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const validated = distributionCenterSchema.partial().parse(req.body);

      const place = await db.query.places.findFirst({
        where: eq(places.id, id),
      });

      if (!place) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      const updated = await db
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

      res.json(updated[0]);
    } catch (error) {
      console.error("Update place error:", error);
      res.status(500).json({ 
        error: "Failed to update distribution center",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
);

// delete distribution center
router.delete(
  "/:id",
  requirePermission("delete_places"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const place = await db.query.places.findFirst({
        where: eq(places.id, req.params.id),
      });

      if (!place) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      await db.delete(places).where(eq(places.id, req.params.id));
      res.json({ message: "Distribution center deleted successfully" });
    } catch (error) {
      console.error("Delete place error:", error);
      res.status(500).json({ error: "Failed to delete distribution center" });
    }
  },
);

export default router;