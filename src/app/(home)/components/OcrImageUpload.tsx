'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { OcrService, OcrResponse } from '../services/OcrService';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface OcrImageUploadProps {
  onTextExtracted: (text: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function OcrImageUpload({ 
  onTextExtracted, 
  label = "Upload Image for OCR", 
  description = "Upload a PNG/JPG image to extract text automatically",
  className = ""
}: OcrImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOcrResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setOcrResult(null);

    try {
      const result = await OcrService.processImageFile(selectedFile, setProgress);
      setOcrResult(result);

      if (result.success && result.text) {
        onTextExtracted(result.text);
      }
    } catch (error) {
      setOcrResult({
        success: false,
        error: 'Failed to process image'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOcrResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`grid gap-4 ${className}`}>
      <div className="grid gap-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button or Preview */}
      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload image
          </span>
        </Button>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          {/* File Info and Preview */}
          <div className="flex items-start gap-4">
            {previewUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Process Button */}
              <div className="mt-2">
                <Button
                  type="button"
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  size="sm"
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      Extract Text
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {ocrResult && (
            <div className="space-y-2">
              {ocrResult.success ? (
                <Alert>
                  <ImageIcon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <span>Text extracted successfully!</span>
                      <span className="text-xs text-muted-foreground">
                        {ocrResult.text?.length} characters
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>{ocrResult.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 