import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { chatRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/", chatRateLimiter, authenticate, chatController.chat);
router.post("/stream", chatRateLimiter, authenticate, chatController.streamChat);

export default router;
