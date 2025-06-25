'use client';

import { useState } from 'react';
import { CircularType, Clause } from '../types/masterCircular';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OcrImageUpload } from './OcrImageUpload';

interface AddAnnexureClauseFormProps {
  circularType: CircularType | string;
  annexureIndex: number;
  annexureTitle: string;
  parentClausePath?: string[];
  onClose: () => void;
  onAdd: (circularType: CircularType | string, annexureIndex: number, clause: Clause, parentClausePath?: string[]) => boolean;
}

export function AddAnnexureClauseForm({
  circularType,
  annexureIndex,
  annexureTitle,
  parentClausePath,
  onClose,
  onAdd,
}: AddAnnexureClauseFormProps) {
  const [clauseNumber, setClauseNumber] = useState('');
  const [clauseTitle, setClauseTitle] = useState('');
  const [clauseContent, setClauseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubclause = parentClausePath && parentClausePath.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clauseNumber.trim()) {
      setError('Please enter a clause number');
      return;
    }
    setIsSubmitting(true);
    try {
      const newClause: Clause = {
        clause_number: clauseNumber.trim(),
        clause_title: clauseTitle.trim() || '',
        clause_content: clauseContent.trim(),
        clauses: [],
      };
      const success = onAdd(circularType, annexureIndex, newClause, parentClausePath);
      if (success) {
        onClose();
      } else {
        setError('Failed to add clause. Clause number might already exist.');
      }
    } catch (err) {
      setError('An error occurred while adding the clause');
      console.error('Error adding clause to annexure:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {isSubclause ? 'Sub-' : ''}Clause</DialogTitle>
          <DialogDescription>
            Add a new {isSubclause ? 'sub-' : ''}clause to Annexure: {annexureTitle}
            {isSubclause && (
              <span className="block mt-1 text-xs">
                Parent clause: {parentClausePath?.join(' → ')}
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
                placeholder="Enter clause content or use OCR..."
                value={clauseContent}
                onChange={(e) => setClauseContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator className="my-2" />

            <OcrImageUpload
              onTextExtracted={(text) =>
                setClauseContent((prev) => (prev ? `${prev}\n\n${text}` : text))
              }
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
              disabled={isSubmitting || !clauseNumber.trim()}
            >
              {isSubmitting ? 'Adding...' : `Add ${isSubclause ? 'Sub-' : ''}Clause`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 