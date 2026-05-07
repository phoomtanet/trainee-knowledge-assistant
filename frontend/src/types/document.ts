export interface UploadResponse {
  message: string;
  data: {
    filename: string;
    size: number;
    mimetype: string;
    preview: string;
  };
}
