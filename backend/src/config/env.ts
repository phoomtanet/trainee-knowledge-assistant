import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "4000",
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/knowledge-assistant",
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantCollection: process.env.QDRANT_COLLECTION || "knowledge",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
} as const;
