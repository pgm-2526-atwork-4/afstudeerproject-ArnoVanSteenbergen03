import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { places } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";
import { distributionCenterSchema } from "@shared/index";

const router = Router();

// get all suppliers
router.get(
  "/",
  requirePermission("read_places"),
  async (req: Request, res: Response) => {
    try {
      const allSuppliers = await db.query.places.findMany({
        where: eq(places.type, "supplier"),
      });
      res.json(allSuppliers);
    } catch (error) {
      console.error("Fetch suppliers error:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  },
);

// get single supplier
router.get(
  "/:id",
  requirePermission("read_places"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const supplier = await db.query.places.findFirst({
        where: and(eq(places.id, req.params.id), eq(places.type, "supplier")),
      });

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

// create supplier
router.post(
  "/",
  requirePermission("create_places"),
  async (req: Request, res: Response) => {
    try {
      const validated = distributionCenterSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .parse({ ...req.body, type: "supplier" });

      const newSupplier = await db
        .insert(places)
        .values({
          name: validated.name,
          type: "supplier",
          geojson: validated.geojson,
          operatingInfo: validated.operatingInfo || null,
          contactInfo: validated.contactInfo || null,
        })
        .returning();

      res.status(201).json(newSupplier[0]);
    } catch (error) {
      console.error("Create supplier error:", error);
      res.status(500).json({ error: "Failed to create supplier" });
    }
  },
);

// update supplier
router.put(
  "/:id",
  requirePermission("update_places"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const supplier = await db.query.places.findFirst({
        where: and(eq(places.id, req.params.id), eq(places.type, "supplier")),
      });

      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      const validated = distributionCenterSchema.partial().parse(req.body);

      const updated = await db
        .update(places)
        .set({
          ...(validated.name && { name: validated.name }),
          ...(validated.geojson && { geojson: validated.geojson }),
          ...(validated.operatingInfo && {
            operatingInfo: validated.operatingInfo,
          }),
          ...(validated.contactInfo && {
            contactInfo: validated.contactInfo,
          }),
          updatedAt: new Date(),
        })
        .where(eq(places.id, req.params.id))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error("Update supplier error:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  },
);

// delete supplier
router.delete(
  "/:id",
  requirePermission("delete_places"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const supplier = await db.query.places.findFirst({
        where: and(eq(places.id, req.params.id), eq(places.type, "supplier")),
      });

      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      await db.delete(places).where(eq(places.id, req.params.id));
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Delete supplier error:", error);
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  },
);

export default router;
