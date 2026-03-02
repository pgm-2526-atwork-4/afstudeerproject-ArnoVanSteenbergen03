import { Router } from "express";
import profileRouter from "./profileRoutes";
import activityRouter from "./activityRoutes";
import { requireAuth, requireApproved } from "@/middleware/auth";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/profile", profileRouter);
router.use("/activities", activityRouter);

export default router;