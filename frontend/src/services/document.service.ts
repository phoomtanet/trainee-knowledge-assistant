import { UploadResponse } from "@/types/document";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const documentService = {
  upload: async (file: File): Promise<UploadResponse["data"]> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_URL}/documents/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const data: UploadResponse = await res.json();
    if (!res.ok) throw new Error((data as { message?: string }).message || "Upload failed");
    return data.data;
  },
};
