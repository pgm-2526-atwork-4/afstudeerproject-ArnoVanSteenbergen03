import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { places } from "@/db/schema";
import { eq } from "drizzle-orm";
import { distributionCenterSchema } from "@shared/schemas/types";

const router = Router();

// GET all distribution centers
router.get("/", async (req: Request, res: Response) => {
  try {
    const allPlaces = await db.query.places.findMany({
      where: eq(places.type, "distribution_center"),
    });
    res.json(allPlaces);
  } catch (error) {
    console.error("Fetch places error:", error);
    res.status(500).json({ error: "Failed to fetch distribution centers" });
  }
});

// CREATE new distribution center
router.post("/", async (req: Request, res: Response) => {
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

    res.status(201).json(newPlace[0]);
  } catch (error) {
    console.error("Create place error:", error);
    res.status(500).json({ error: "Failed to create distribution center" });
  }
});

// GET single distribution center
router.get("/:id", async (req: Request, res: Response) => {
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
});

// UPDATE distribution center
router.put("/:id", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Failed to update distribution center" });
  }
});

export default router;