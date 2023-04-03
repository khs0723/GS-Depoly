import { Request, Response, Router } from "express";
import userControllers from "../controllers/user";
import userMiddleware from "../middleware/user";
import authMiddleware from "../middleware/auth";

const router = Router();

router.get("/:username", userMiddleware, userControllers.getUser);

export default router;
