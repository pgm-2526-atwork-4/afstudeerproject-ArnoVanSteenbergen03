import { Router } from "express";
import { requireAuth, requireRoles } from "@/middleware/auth";
import profileRouter from "./profileRoutes";

const router = Router();

// Role check
router.use(requireAuth, requireRoles(["admin"]));

router.use("/profile", profileRouter);

export default router;