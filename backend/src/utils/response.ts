import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types/common";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void => {
  res.status(statusCode).json({ message, data } as ApiResponse<T>);
};

export const sendCreated = <T>(res: Response, data: T, message = "Created"): void => {
  sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  result: PaginatedResponse<T>,
  message = "Success"
): void => {
  res.status(200).json({ message, ...result });
};
