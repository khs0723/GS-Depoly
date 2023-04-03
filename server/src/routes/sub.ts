import { Router } from "express";
import subControllers from "../controllers/sub";
import userMiddleware from "../middleware/user";
import authMiddleware from "../middleware/auth";

const router = Router();

router.post("/", userMiddleware, authMiddleware, subControllers.createSub);
router.get("/sub/topSubs", subControllers.topSubs);
router.get("/:name", userMiddleware, subControllers.getSub);

router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  subControllers.ownSub,
  subControllers.upload.single("file"),
  subControllers.uploadSubImage
);
export default router;
