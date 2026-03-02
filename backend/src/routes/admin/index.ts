import { Router } from "express";
import { requireAuth, requireApproved } from "@/middleware/auth";
import profileRouter from "./profileRoutes";
import distroRouter from "./distroRoutes";
import ordersRouter from "./ordersRoutes";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/profile", profileRouter);
router.use("/distro", distroRouter);
router.use("/orders", ordersRouter);

export default router;