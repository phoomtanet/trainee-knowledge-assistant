import { Router } from "express";
import { documentController } from "../controllers/document.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadMiddleware } from "../middlewares/upload.middleware";
import { uploadRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/upload", uploadRateLimiter, authenticate, uploadMiddleware.single("file"), documentController.upload);

export default router;
