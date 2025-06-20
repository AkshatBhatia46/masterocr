'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { NormalCircularFormData } from "../types/masterCircular";

interface AddNormalCircularFormProps {
  onClose: () => void;
  onAdd: (circularName: string) => boolean;
  existingNames: string[];
}

export function AddNormalCircularForm({ onClose, onAdd, existingNames }: AddNormalCircularFormProps) {
  const [formData, setFormData] = useState<NormalCircularFormData>({
    circular_name: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedName = formData.circular_name.trim();
    
    if (!trimmedName) {
      setError('Circular name is required');
      setLoading(false);
      return;
    }

    // Check for duplicates (case-insensitive)
    if (existingNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A circular with this name already exists');
      setLoading(false);
      return;
    }

    try {
      const success = onAdd(trimmedName);
      if (success) {
        onClose();
      } else {
        setError('Failed to create circular. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while creating the circular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Normal Circular</DialogTitle>
          <DialogDescription>
            Enter a unique name for the new normal circular. This circular will contain clauses and annexures without chapters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="circular_name" className="text-right">
                Name
              </Label>
              <Input
                id="circular_name"
                value={formData.circular_name}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, circular_name: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g. RBI Circular 2024-25/01"
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 mt-2">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.circular_name.trim()}>
              {loading ? 'Creating...' : 'Create Circular'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 