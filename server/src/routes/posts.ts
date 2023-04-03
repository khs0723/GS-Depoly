import { Router } from "express";
import postControllers from "../controllers/post";
import userMiddleware from "../middleware/user";
import authMiddleware from "../middleware/auth";

const router = Router();

router.post("/", userMiddleware, authMiddleware, postControllers.createPost);
router.get("/:identifier/:slug", userMiddleware, postControllers.getPost);
router.post(
  "/:identifier/:slug/comments",
  userMiddleware,
  postControllers.createComment
);
router.get(
  "/:identifier/:slug/comments",
  userMiddleware,
  postControllers.getComments
);

router.get("/", userMiddleware, postControllers.getPosts);
export default router;
