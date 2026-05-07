import express, { Application, Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// routes will be registered here in future sessions

app.use(errorHandler);

export default app;
