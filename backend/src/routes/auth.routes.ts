import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/rateLimiter";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginRateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

export default router;
