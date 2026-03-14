import { Router } from "express";
import activityRouter from "./activityRoutes";
import { requireAuth, requireApproved } from "@/middleware/auth";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/activities", activityRouter);

export default router;