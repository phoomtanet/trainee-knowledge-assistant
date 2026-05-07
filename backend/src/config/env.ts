import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "4000",
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/knowledge-assistant",
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantCollection: process.env.QDRANT_COLLECTION || "knowledge",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "change-this-refresh-secret",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
} as const;
