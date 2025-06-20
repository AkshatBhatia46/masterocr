'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { OcrService, OcrResponse } from '../services/OcrService';
import { Upload, Image as ImageIcon, X, Loader2, FileText } from 'lucide-react';

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: OcrResponse;
  progress: number;
}

interface OcrImageUploadProps {
  onTextExtracted: (text: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function OcrImageUpload({ 
  onTextExtracted, 
  label = "Upload Images for OCR", 
  description = "Upload multiple PNG/JPG images to extract text automatically. Text from all images will be combined.",
  className = ""
}: OcrImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newFiles: FileWithPreview[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleProcessImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    const allExtractedTexts: string[] = [];

    // Process files sequentially to avoid overwhelming the API
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileItem = selectedFiles[i];
      
      // Update status to processing
      setSelectedFiles(prev => 
        prev.map((item, index) => 
          index === i ? { ...item, status: 'processing', progress: 0 } : item
        )
      );

      try {
        const result = await OcrService.processImageFile(
          fileItem.file, 
          (progress) => {
            setSelectedFiles(prev => 
              prev.map((item, index) => 
                index === i ? { ...item, progress } : item
              )
            );
          }
        );

        // Update file status and result
        setSelectedFiles(prev => 
          prev.map((item, index) => 
            index === i ? { 
              ...item, 
              status: result.success ? 'completed' : 'error',
              result,
              progress: 100
            } : item
          )
        );

        if (result.success && result.text) {
          allExtractedTexts.push(result.text);
        }

      } catch (error) {
        setSelectedFiles(prev => 
          prev.map((item, index) => 
            index === i ? { 
              ...item, 
              status: 'error',
              result: { success: false, error: 'Failed to process image' },
              progress: 0
            } : item
          )
        );
      }
    }

    setExtractedTexts(allExtractedTexts);
    
    // Combine all extracted texts and pass to parent
    if (allExtractedTexts.length > 0) {
      const combinedText = allExtractedTexts.join('\n\n---\n\n');
      onTextExtracted(combinedText);
    }

    setIsProcessing(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleRemoveAllFiles = () => {
    selectedFiles.forEach(item => URL.revokeObjectURL(item.preview));
    setSelectedFiles([]);
    setExtractedTexts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const completedCount = selectedFiles.filter(f => f.status === 'completed').length;
  const errorCount = selectedFiles.filter(f => f.status === 'error').length;
  const totalTextLength = extractedTexts.reduce((sum, text) => sum + text.length, 0);

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
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="flex-1 h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload images
          </span>
          {selectedFiles.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Selected Images ({selectedFiles.length})
            </h3>
            <div className="flex gap-2">
              {!isProcessing && (
                <Button
                  type="button"
                  onClick={handleProcessImages}
                  size="sm"
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Extract Text from All
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAllFiles}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-3">
            {selectedFiles.map((fileItem, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <img 
                    src={fileItem.preview} 
                    alt={fileItem.file.name} 
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="mt-2">
                    {fileItem.status === 'pending' && (
                      <span className="text-xs text-muted-foreground">Ready to process</span>
                    )}
                    {fileItem.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                    )}
                    {fileItem.status === 'completed' && fileItem.result?.success && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          Completed ({fileItem.result.text?.length} characters)
                        </span>
                      </div>
                    )}
                    {fileItem.status === 'error' && (
                      <span className="text-xs text-red-600">
                        Error: {fileItem.result?.error || 'Failed to process'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          {isProcessing && (
            <div className="mt-4 p-3 bg-muted rounded">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing images...</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Completed: {completedCount}/{selectedFiles.length}
                {errorCount > 0 && ` (${errorCount} errors)`}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {!isProcessing && completedCount > 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <span>
                    Successfully processed {completedCount} of {selectedFiles.length} images
                    {errorCount > 0 && ` (${errorCount} failed)`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalTextLength} total characters
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
} 