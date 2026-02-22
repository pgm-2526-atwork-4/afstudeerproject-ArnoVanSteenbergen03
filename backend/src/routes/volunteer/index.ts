import { Router } from "express";
import profileRouter from "./profileRoutes";

const router = Router();

router.use("/profile", profileRouter);

export default router;