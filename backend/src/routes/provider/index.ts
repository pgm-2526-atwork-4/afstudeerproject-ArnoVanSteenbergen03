import { Router } from "express";
import { requireAuth, requireRoles } from "@/middleware/auth";
import profileRouter from "./profileRoutes";
import vehiclesRouter from "./vehiclesRoutes";
import orderRouter from "./orderRoutes";

const router = Router();

// Role check
router.use(requireAuth, requireRoles(["provider"]));

router.use("/profile", profileRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/orders", orderRouter);

export default router;