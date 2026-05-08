import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { conversationController } from "../controllers/conversation.controller";

const router = Router();

router.use(authenticate);

router.post("/", conversationController.create);
router.get("/", conversationController.list);
router.get("/:id", conversationController.get);
router.put("/:id", conversationController.save);
router.patch("/:id/file", conversationController.updateFile);

export default router;
