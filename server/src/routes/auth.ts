import { Request, Response, Router } from "express";
import authControllers from "../controllers/auth";
import userMiddleware from "../middleware/user";
import authMiddleware from "../middleware/auth";

const router = Router();

router.get("/me", userMiddleware, authMiddleware, authControllers.me);

router.post("/register", authControllers.register);

router.post("/login", authControllers.login);

router.post("/logout", userMiddleware, authMiddleware, authControllers.logout);

export default router;
