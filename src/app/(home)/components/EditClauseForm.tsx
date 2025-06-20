'use client';

import { useState, useEffect } from 'react';
import { CircularType, Clause } from '../types/masterCircular';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OcrImageUpload } from './OcrImageUpload';

interface EditClauseFormProps {
  circularType: CircularType | string;
  chapterIndex: number;
  chapterNumber: string;
  chapterTitle: string;
  clause: Clause;
  clausePath: string[];
  onClose: () => void;
  onUpdate: (circularType: CircularType | string, chapterIndex: number, clausePath: string[], clause: Clause) => boolean;
}

export function EditClauseForm({ 
  circularType, 
  chapterIndex, 
  chapterNumber, 
  chapterTitle, 
  clause,
  clausePath,
  onClose, 
  onUpdate 
}: EditClauseFormProps) {
  const [clauseNumber, setClauseNumber] = useState('');
  const [clauseTitle, setClauseTitle] = useState('');
  const [clauseContent, setClauseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubclause = clausePath.length > 1;

  // Initialize form with existing clause data
  useEffect(() => {
    setClauseNumber(clause.clause_number);
    setClauseTitle(clause.clause_title || '');
    setClauseContent(clause.clause_content || '');
  }, [clause]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clauseNumber.trim()) {
      setError('Please enter a clause number');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedClause: Clause = {
        ...clause,
        clause_number: clauseNumber.trim(),
        clause_title: clauseTitle.trim() || '',
        clause_content: clauseContent.trim(),
        // Preserve existing subclauses
        clauses: clause.clauses || []
      };

      const success = onUpdate(circularType, chapterIndex, clausePath, updatedClause);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update clause. Clause number might already exist.');
      }
    } catch (err) {
      setError('An error occurred while updating the clause');
      console.error('Error updating clause:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {isSubclause ? 'Sub-' : ''}Clause
          </DialogTitle>
          <DialogDescription>
            Edit the {isSubclause ? 'sub-' : ''}clause in Chapter {chapterNumber}: {chapterTitle}
            {isSubclause && (
              <span className="block mt-1 text-xs">
                Clause path: {clausePath.join(' → ')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clause-number">
                Clause Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clause-number"
                placeholder="e.g., 1.1, 2.3.1, etc."
                value={clauseNumber}
                onChange={(e) => setClauseNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clause-title">
                Clause Title <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="clause-title"
                placeholder="Enter clause title (optional)"
                value={clauseTitle}
                onChange={(e) => setClauseTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clause-content">
                Clause Content <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="clause-content"
                placeholder="Enter clause content or use OCR to extract from image..."
                value={clauseContent}
                onChange={(e) => setClauseContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator className="my-2" />

            {/* OCR Image Upload */}
            <OcrImageUpload
              onTextExtracted={(text) => setClauseContent(prev => prev ? `${prev}\n\n${text}` : text)}
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
              disabled={isSubmitting || !clauseNumber.trim()}
            >
              {isSubmitting ? 'Updating...' : `Update ${isSubclause ? 'Sub-' : ''}Clause`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 