import { Request, Response, Router } from "express";
import voteControllers from "../controllers/vote";
import userMiddleware from "../middleware/user";
import authMiddleware from "../middleware/auth";

const router = Router();

router.post("/", userMiddleware, authMiddleware, voteControllers.vote);

export default router;
