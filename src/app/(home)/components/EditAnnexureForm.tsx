'use client';

import { useState, useEffect } from 'react';
import { CircularType, Annexure } from '../types/masterCircular';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OcrImageUpload } from './OcrImageUpload';

interface EditAnnexureFormProps {
  circularType: CircularType | string;
  annexureIndex: number;
  annexure: Annexure;
  onClose: () => void;
  onUpdate: (circularType: CircularType | string, annexureIndex: number, annexure: Annexure) => boolean;
}

export function EditAnnexureForm({ circularType, annexureIndex, annexure, onClose, onUpdate }: EditAnnexureFormProps) {
  const [annexureTitle, setAnnexureTitle] = useState('');
  const [annexureContent, setAnnexureContent] = useState('');
  const [annexureType, setAnnexureType] = useState<'form' | 'non-form'>('non-form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnnexureTitle(annexure.annexure_title);
    setAnnexureContent(annexure.annexure_content || '');
    setAnnexureType(annexure.annexure_type || 'non-form');
  }, [annexure]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!annexureTitle.trim()) {
      setError('Please enter an annexure title');
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedAnnexure: Annexure = {
        ...annexure,
        annexure_title: annexureTitle.trim(),
        annexure_content: annexureContent.trim(),
        annexure_type: annexureType,
        clauses: annexure.clauses || [],
      };
      const success = onUpdate(circularType, annexureIndex, updatedAnnexure);
      if (success) {
        onClose();
      } else {
        setError('Failed to update annexure');
      }
    } catch (err) {
      setError('An error occurred while updating the annexure');
      console.error('Error updating annexure:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Annexure</DialogTitle>
          <DialogDescription>
            Modify the annexure for circular ({circularType})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="annexure-title">
                Annexure Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="annexure-title"
                placeholder="Enter annexure title"
                value={annexureTitle}
                onChange={(e) => setAnnexureTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label>Annexure Type <span className="text-destructive">*</span></Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="non-form"
                    id="edit-non-form"
                    checked={annexureType === 'non-form'}
                    onChange={(e) => setAnnexureType(e.target.value as 'form' | 'non-form')}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor="edit-non-form" className="font-normal">Non Form Annexures</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="form"
                    id="edit-form"
                    checked={annexureType === 'form'}
                    onChange={(e) => setAnnexureType(e.target.value as 'form' | 'non-form')}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor="edit-form" className="font-normal">Form Annexures</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="annexure-content">
                Annexure Content <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="annexure-content"
                placeholder="Enter annexure content or use OCR to extract from image..."
                value={annexureContent}
                onChange={(e) => setAnnexureContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator className="my-2" />

            <OcrImageUpload
              onTextExtracted={(text) => setAnnexureContent(prev => prev ? `${prev}\n\n${text}` : text)}
              label="Extract Content from Image"
              description="Upload an image to automatically extract text and populate the content field"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !annexureTitle.trim()}>
              {isSubmitting ? 'Updating...' : 'Update Annexure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 