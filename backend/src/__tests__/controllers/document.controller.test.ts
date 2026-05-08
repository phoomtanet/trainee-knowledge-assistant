jest.mock("../../services/document.service", () => ({
  documentService: {
    parse: jest.fn().mockResolvedValue({
      filename: "report.pdf",
      mimetype: "application/pdf",
      size: 2048,
      path: "/tmp/report.pdf",
      text: "document content here",
      chunksStored: 5,
    }),
  },
}));

jest.mock("../../utils/response", () => ({
  sendSuccess: jest.fn(),
}));

import { Request, Response, NextFunction } from "express";
import { documentController } from "../../controllers/document.controller";
import { documentService } from "../../services/document.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";
import { AuthRequest } from "../../middlewares/auth.middleware";

function makeReq(file?: Express.Multer.File): AuthRequest {
  return { file } as AuthRequest;
}

function makeRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("documentController.upload", () => {
  const next = jest.fn() as NextFunction;

  afterEach(() => jest.clearAllMocks());

  it("calls documentService.parse and sendSuccess on valid file", async () => {
    const file = { originalname: "report.pdf", mimetype: "application/pdf" } as Express.Multer.File;
    const req = makeReq(file);
    const res = makeRes();

    await documentController.upload(req, res, next);

    expect(documentService.parse).toHaveBeenCalledWith(file);
    expect(sendSuccess).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        filename: "report.pdf",
        chunksStored: 5,
        preview: expect.any(String),
      }),
      expect.any(String)
    );
  });

  it("calls next with AppError when no file is uploaded", async () => {
    const req = makeReq(undefined);
    const res = makeRes();

    await documentController.upload(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(400);
  });

  it("calls next with error when service throws", async () => {
    (documentService.parse as jest.Mock).mockRejectedValueOnce(new AppError(400, "Unsupported file type"));
    const file = { originalname: "img.png", mimetype: "image/png" } as Express.Multer.File;
    const req = makeReq(file);
    const res = makeRes();

    await documentController.upload(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("preview is truncated to 500 characters", async () => {
    const longText = "x".repeat(1000);
    (documentService.parse as jest.Mock).mockResolvedValueOnce({
      filename: "big.pdf",
      mimetype: "application/pdf",
      size: 5000,
      path: "/tmp/big.pdf",
      text: longText,
      chunksStored: 10,
    });

    const file = { originalname: "big.pdf" } as Express.Multer.File;
    const req = makeReq(file);
    const res = makeRes();

    await documentController.upload(req, res, next);

    const sentData = (sendSuccess as jest.Mock).mock.calls[0][1];
    expect(sentData.preview.length).toBe(500);
  });
});
