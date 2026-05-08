import { Request, Response, NextFunction } from "express";
import { AppError, errorHandler } from "../../middlewares/errorHandler";

const mockReq = {} as Request;
const mockNext = jest.fn() as NextFunction;

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("AppError", () => {
  it("sets statusCode and message correctly", () => {
    const err = new AppError(404, "Not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    expect(new AppError(500, "fail")).toBeInstanceOf(Error);
  });
});

describe("errorHandler", () => {
  it("responds with AppError statusCode and message", () => {
    const res = mockRes();
    const err = new AppError(422, "Validation failed");
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
  });

  it("responds with 500 for unknown errors", () => {
    const res = mockRes();
    const err = new Error("Something broke");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    errorHandler(err, mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    consoleSpy.mockRestore();
  });
});
