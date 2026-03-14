import { Router } from "express";
import { requireAuth, requireApproved } from "@/middleware/auth";
import vehiclesRouter from "./vehiclesRoutes";
import orderRouter from "./orderRoutes";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/vehicles", vehiclesRouter);
router.use("/orders", orderRouter);

export default router;