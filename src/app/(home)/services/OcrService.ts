import { transformText } from "../components/ChaptersList";

export interface OcrResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export class OcrService {
  private static readonly OCR_API_URL = "https://master-ocr.onfinance.ai/ocr_image";

  static async extractTextFromImage(file: File): Promise<OcrResponse> {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return {
          success: false,
          error: "Please upload a valid image file",
        };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: "File size should be less than 10MB",
        };
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append("file", file);

      // Make the API request
      const response = await fetch(this.OCR_API_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle the specific OCR API response format
      if (result.status === "success" && result.markdown) {
        return {
          success: true,
          text: transformText(result.markdown),
        };
      } else if (result.status === "error" || result.error) {
        return {
          success: false,
          error: result.error || "OCR processing failed",
        };
      } else if (
        result.text ||
        result.extracted_text ||
        result.content ||
        result.markdown
      ) {
        // Fallback for other possible response formats
        return {
          success: true,
          text:
            result.markdown ||
            result.text ||
            result.extracted_text ||
            result.content ||
            "",
        };
      } else {
        // If response format is unexpected, try to extract any text-like property
        const textValue = Object.values(result).find(
          (value) =>
            typeof value === "string" &&
            value.length > 0 &&
            value !== result.filename
        ) as string;

        return {
          success: true,
          text: textValue || "No text extracted from image",
        };
      }
    } catch (error) {
      console.error("OCR API Error:", error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: "Network error: Unable to connect to OCR service",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract text from image",
      };
    }
  }

  static async processImageFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<OcrResponse> {
    // Simulate progress for better UX
    if (onProgress) {
      onProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10));
      }, 200);

      try {
        const result = await this.extractTextFromImage(file);
        clearInterval(progressInterval);
        onProgress(100);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    }

    return this.extractTextFromImage(file);
  }
}
