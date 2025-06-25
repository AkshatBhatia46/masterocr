'use client';

import { useState } from 'react';
import { CircularType, Annexure } from '../types/masterCircular';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Using regular radio inputs instead of shadcn radio-group component
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OcrImageUpload } from './OcrImageUpload';
import { Upload } from 'lucide-react';

interface AddAnnexureFormProps {
  circularType: CircularType | string;
  onClose: () => void;
  onAdd: (circularType: CircularType | string, annexure: Annexure) => boolean;
}

export function AddAnnexureForm({ circularType, onClose, onAdd }: AddAnnexureFormProps) {
  const [annexureTitle, setAnnexureTitle] = useState('');
  const [annexureContent, setAnnexureContent] = useState('');
  const [annexureType, setAnnexureType] = useState<'form' | 'non-form'>('non-form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!annexureTitle.trim()) {
      setError('Please enter an annexure title');
      return;
    }

    setIsSubmitting(true);

    try {
      const newAnnexure: Annexure = {
        annexure_title: annexureTitle.trim(),
        annexure_content: annexureContent.trim(),
        annexure_type: annexureType,
        clauses: []
      };

      const success = onAdd(circularType, newAnnexure);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to add annexure');
      }
    } catch (err) {
      setError('An error occurred while adding the annexure');
      console.error('Error adding annexure:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Annexure</DialogTitle>
          <DialogDescription>
            Add a new annexure to the Master Circular For Mutual Funds ({circularType})
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

            <div className="grid gap-3">
              <Label>Annexure Type <span className="text-destructive">*</span></Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="non-form"
                    id="non-form"
                    checked={annexureType === 'non-form'}
                    onChange={(e) => setAnnexureType(e.target.value as 'form' | 'non-form')}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor="non-form" className="font-normal">Non Form Annexures</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="form"
                    id="form"
                    checked={annexureType === 'form'}
                    onChange={(e) => setAnnexureType(e.target.value as 'form' | 'non-form')}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor="form" className="font-normal">Form Annexures</Label>
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

            {/* OCR Image Upload */}
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
              disabled={isSubmitting || !annexureTitle.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Annexure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 