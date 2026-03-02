import { Router } from "express";
import { requireAuth, requireApproved } from "@/middleware/auth";
import profileRouter from "./profileRoutes";
import vehiclesRouter from "./vehiclesRoutes";
import orderRouter from "./orderRoutes";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/profile", profileRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/orders", orderRouter);

export default router;