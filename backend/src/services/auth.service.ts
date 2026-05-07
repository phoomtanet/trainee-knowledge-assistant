import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/errorHandler";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.accessTokenExpiresIn,
  } as jwt.SignOptions);

const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  } as jwt.SignOptions);

export const authService = {
  login: async (username: string, password: string) => {
    const user = await userRepository.findByUsername(username.trim());
    if (!user) throw new AppError(401, "Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError(401, "Invalid credentials");

    const payload: JwtPayload = {
      id: String(user._id),
      username: user.username,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await userRepository.updateRefreshToken(payload.id, refreshToken);

    return { accessToken, refreshToken, user: payload };
  },

  refresh: async (refreshToken: string) => {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, env.refreshTokenSecret) as JwtPayload;
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) throw new AppError(401, "Refresh token revoked");

    const newAccessToken = signAccessToken({
      id: String(user._id),
      username: user.username,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  },

  logout: async (userId: string) => {
    await userRepository.updateRefreshToken(userId, null);
  },
};
