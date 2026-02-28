import { Router } from "express";
import profileRouter from "./profileRoutes";
import activityRouter from "./activityRoutes";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = Router();

router.use(requireAuth, requireRoles(["volunteer"]));

router.use("/profile", profileRouter);
router.use("/activities", activityRouter);

export default router;