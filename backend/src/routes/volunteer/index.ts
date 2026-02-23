import { Router } from "express";
import profileRouter from "./profileRoutes";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = Router();

router.use(requireAuth, requireRoles(["volunteer"]));

router.use("/profile", profileRouter);

export default router;