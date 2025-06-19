'use client';

import { useState, useEffect } from 'react';
import { CircularType, Chapter } from '../types/masterCircular';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OcrImageUpload } from './OcrImageUpload';

interface EditChapterFormProps {
  circularType: CircularType;
  chapterIndex: number;
  chapter: Chapter;
  onClose: () => void;
  onUpdate: (circularType: CircularType, chapterIndex: number, chapter: Chapter) => boolean;
}

export function EditChapterForm({ circularType, chapterIndex, chapter, onClose, onUpdate }: EditChapterFormProps) {
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing chapter data
  useEffect(() => {
    setChapterNumber(chapter.chapter_number);
    setChapterTitle(chapter.chapter_title);
    // Extract content from the chapter if it exists (we need to add this to the interface)
    setChapterContent(chapter.chapter_content || '');
  }, [chapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!chapterNumber.trim() || !chapterTitle.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedChapter: Chapter = {
        ...chapter,
        chapter_number: chapterNumber.trim(),
        chapter_title: chapterTitle.trim(),
        chapter_content: chapterContent.trim()
      };

      const success = onUpdate(circularType, chapterIndex, updatedChapter);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update chapter. Chapter number might already exist.');
      }
    } catch (err) {
      setError('An error occurred while updating the chapter');
      console.error('Error updating chapter:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>
            Modify the chapter details for Master Circular For Mutual Funds ({circularType})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chapter-number">
                Chapter Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-number"
                placeholder="e.g., 1, 2A, 3.1, etc."
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chapter-title">
                Chapter Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-title"
                placeholder="Enter chapter title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chapter-content">
                Chapter Content <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="chapter-content"
                placeholder="Enter chapter content or use OCR to extract from image..."
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator className="my-2" />

            {/* OCR Image Upload */}
            <OcrImageUpload
              onTextExtracted={(text) => setChapterContent(prev => prev ? `${prev}\n\n${text}` : text)}
              label="Extract Content from Image"
              description="Upload an image to automatically extract text and add to the content field"
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !chapterNumber.trim() || !chapterTitle.trim()}
            >
              {isSubmitting ? 'Updating...' : 'Update Chapter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 