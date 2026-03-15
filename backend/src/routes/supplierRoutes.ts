import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { places } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";
import { distributionCenterSchema } from "@shared/index";

const router = Router();

// Get all suppliers
router.get(
  "/",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const suppliers = await db
        .select()
        .from(places)
        .where(eq(places.type, "supplier"));
      res.json(suppliers);
    } catch (error) {
      console.error("Fetch suppliers error:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  },
);

// Get single supplier
router.get(
  "/:id",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [supplier] = await db
        .select()
        .from(places)
        .where(and(eq(places.id, id), eq(places.type, "supplier")));

      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      res.json(supplier);
    } catch (error) {
      console.error("Fetch supplier error:", error);
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  },
);

// Create supplier
router.post(
  "/",
  requirePermission("create_places"),
  async (req: Request, res: Response) => {
    try {
      const validated = distributionCenterSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .parse({ ...req.body, type: "supplier" });

      const [newSupplier] = await db
        .insert(places)
        .values({
          name: validated.name,
          type: "supplier",
          geojson: validated.geojson,
          operatingInfo: validated.operatingInfo || null,
          contactInfo: validated.contactInfo || null,
        })
        .returning();

      res.status(201).json(newSupplier);
    } catch (error) {
      console.error("Create supplier error:", error);
      res.status(500).json({ error: "Failed to create supplier" });
    }
  },
);

// Update supplier
router.put(
  "/:id",
  requirePermission("update_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [supplier] = await db
        .select()
        .from(places)
        .where(and(eq(places.id, id), eq(places.type, "supplier")));

      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      const validated = distributionCenterSchema.partial().parse(req.body);

      const [updated] = await db
        .update(places)
        .set({
          ...(validated.name && { name: validated.name }),
          ...(validated.geojson && { geojson: validated.geojson }),
          ...(validated.operatingInfo && { operatingInfo: validated.operatingInfo }),
          ...(validated.contactInfo && { contactInfo: validated.contactInfo }),
          updatedAt: new Date(),
        })
        .where(eq(places.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update supplier error:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  },
);

// Delete supplier
router.delete(
  "/:id",
  requirePermission("delete_places"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const [supplier] = await db
        .select()
        .from(places)
        .where(and(eq(places.id, id), eq(places.type, "supplier")));

      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      await db.delete(places).where(eq(places.id, id));
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Delete supplier error:", error);
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  },
);

export default router;
