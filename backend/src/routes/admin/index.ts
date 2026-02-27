import { Router } from "express";
import { requireAuth, requireRoles } from "@/middleware/auth";
import profileRouter from "./profileRoutes";
import distroRouter from "./distroRoutes";

const router = Router();

// Role check
router.use(requireAuth, requireRoles(["admin"]));

router.use("/profile", profileRouter);
router.use("/distro", distroRouter);

export default router;