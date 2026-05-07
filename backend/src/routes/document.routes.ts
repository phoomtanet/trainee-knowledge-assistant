import { Router } from "express";
import { documentController } from "../controllers/document.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const router = Router();

router.post("/upload", authenticate, uploadMiddleware.single("file"), documentController.upload);

export default router;
