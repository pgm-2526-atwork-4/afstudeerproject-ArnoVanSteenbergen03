import { Router } from "express";
import { requireAuth, requireRoles } from "@/middleware/auth";
import profileRouter from "./profileRoutes";
import vehiclesRouter from "./vehiclesRoutes";

const router = Router();

// Role check
router.use(requireAuth, requireRoles(["provider"]));

router.use("/profile", profileRouter);
router.use("/vehicles", vehiclesRouter);

export default router;