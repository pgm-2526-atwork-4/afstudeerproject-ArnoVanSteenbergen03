import { Router } from "express";
import { requireAuth, requireApproved } from "@/middleware/auth";
import distroRouter from "./distroRoutes";
import ordersRouter from "./ordersRoutes";
import applicationsRouter from "./applicationsRoutes";
import usersRouter from "./userRoutes";
import suppliersRouter from "./supplierRoutes";

const router = Router();

router.use(requireAuth, requireApproved);

router.use("/distro", distroRouter);
router.use("/orders", ordersRouter);
router.use("/applications", applicationsRouter);
router.use("/users", usersRouter);
router.use("/suppliers", suppliersRouter);

export default router;