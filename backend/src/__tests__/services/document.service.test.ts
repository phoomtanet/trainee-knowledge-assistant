jest.mock("../../utils/fileParser", () => ({
  parsePdf: jest.fn().mockResolvedValue("pdf content"),
  parseTxt: jest.fn().mockResolvedValue("txt content"),
}));

jest.mock("../../services/embedding.service", () => ({
  embeddingService: {
    storeDocument: jest.fn().mockResolvedValue(3),
  },
}));

import { documentService } from "../../services/document.service";
import { parsePdf, parseTxt } from "../../utils/fileParser";
import { embeddingService } from "../../services/embedding.service";
import { AppError } from "../../middlewares/errorHandler";

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: "file",
    originalname: "test.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    path: "/tmp/test.pdf",
    size: 1024,
    destination: "/tmp",
    filename: "test.pdf",
    buffer: Buffer.from(""),
    stream: null as never,
    ...overrides,
  };
}

describe("documentService.parse", () => {
  afterEach(() => jest.clearAllMocks());

  it("parses PDF file and returns correct fields", async () => {
    const file = makeFile();
    const result = await documentService.parse(file);
    expect(parsePdf).toHaveBeenCalledWith("/tmp/test.pdf");
    expect(result.text).toBe("pdf content");
    expect(result.mimetype).toBe("application/pdf");
    expect(result.chunksStored).toBe(3);
  });

  it("parses TXT file correctly", async () => {
    const file = makeFile({ originalname: "note.txt", mimetype: "text/plain", path: "/tmp/note.txt" });
    const result = await documentService.parse(file);
    expect(parseTxt).toHaveBeenCalledWith("/tmp/note.txt");
    expect(result.text).toBe("txt content");
  });

  it("throws AppError for unsupported file type", async () => {
    const file = makeFile({ mimetype: "image/png" });
    await expect(documentService.parse(file)).rejects.toBeInstanceOf(AppError);
  });

  it("still succeeds when embedding fails (best-effort)", async () => {
    (embeddingService.storeDocument as jest.Mock).mockRejectedValueOnce(new Error("Qdrant down"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const file = makeFile();
    const result = await documentService.parse(file);
    expect(result.chunksStored).toBe(0);
    expect(result.text).toBe("pdf content");
    consoleSpy.mockRestore();
  });

  it("decodes Thai filename from latin1 to utf8", async () => {
    const thaiName = "ใบนัดหมาย.pdf";
    const latin1Encoded = Buffer.from(thaiName).toString("latin1");
    const file = makeFile({ originalname: latin1Encoded });
    const result = await documentService.parse(file);
    expect(result.filename).toBe(thaiName);
  });
});
