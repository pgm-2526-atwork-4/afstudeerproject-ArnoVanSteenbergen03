import { Router } from "express";
import { db } from "@/config/database";
import { vehicles } from "@/db/schema";

const router = Router();

// Get all vehicles
router.get("/", async (req, res) => {
  try {
    const allVehicles = await db.select().from(vehicles);
    res.json(allVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

export default router;
