import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AppError } from "../middlewares/errorHandler";
import { sendSuccess } from "../utils/response";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new AppError(400, "Username and password are required");
      }

      const result = await authService.login(username, password);

      res.cookie("token", result.accessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", result.refreshToken, {
        ...COOKIE_BASE,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result.user, "Login successful");
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) throw new AppError(401, "Refresh token not found");

      const result = await authService.refresh(refreshToken);

      res.cookie("token", result.accessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      });

      sendSuccess(res, null, "Token refreshed");
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      await authService.logout(refreshToken);
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      sendSuccess(res, null, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },
};
