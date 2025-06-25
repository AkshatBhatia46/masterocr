'use client';

import { Annexure, CircularType, CircularMode } from '../types/masterCircular';
import { useCircularData } from '../hooks/useMasterCircularData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Plus, Trash2 } from 'lucide-react';
import { NormalCircularClausesList } from './NormalCircularClausesList';

interface AnnexuresListProps {
  annexures: Annexure[];
  circularType: CircularType | string;
  mode?: CircularMode;
  onAddClause?: (annexureIndex: number, annexure: Annexure, parentClausePath?: string[]) => void;
  onEditAnnexure?: (annexureIndex: number, annexure: Annexure) => void;
  onDeleteAnnexure?: (annexureIndex: number, annexureTitle: string) => void;
}

export function AnnexuresList({ annexures, circularType, mode = 'master', onAddClause, onEditAnnexure, onDeleteAnnexure }: AnnexuresListProps) {
  const { deleteAnnexure, deleteAnnexureFromNormalCircular } = useCircularData();

  const handleDeleteAnnexure = (annexureIndex: number, annexureTitle: string) => {
    if (onDeleteAnnexure) {
      onDeleteAnnexure(annexureIndex, annexureTitle);
    } else {
      if (confirm(`Are you sure you want to delete the annexure "${annexureTitle}"?`)) {
        if (mode === 'master') {
          deleteAnnexure(circularType as CircularType, annexureIndex);
        } else {
          deleteAnnexureFromNormalCircular(circularType as string, annexureIndex);
        }
      }
    }
  };

  if (annexures.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No annexures yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding your first annexure to the {circularType} circular.
        </p>
        <p className="text-sm text-muted-foreground">
          Click the "Add Annexure" button above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {annexures.map((annexure, index) => (
        <Card key={`${annexure.annexure_title}-${index}`} className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {annexure.annexure_type && (
                    <Badge variant={annexure.annexure_type === 'form' ? 'default' : 'secondary'} className="text-xs">
                      {annexure.annexure_type === 'form' ? 'Form' : 'Non-Form'}
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{annexure.annexure_title}</CardTitle>
                  <CardDescription className="text-sm">
                    {annexure.annexure_type === 'form' ? 'Form Annexure' : 'Non-Form Annexure'}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (onEditAnnexure) {
                      onEditAnnexure(index, annexure);
                    } else {
                      console.log('Edit annexure:', annexure.annexure_title);
                    }
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {annexure.annexure_type === 'non-form' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Add clause"
                    onClick={() => onAddClause?.(index, annexure)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteAnnexure(index, annexure.annexure_title)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {annexure.annexure_content && (
            <CardContent className="pt-0">
              <div className="border border-dashed rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {annexure.annexure_content}
                </p>
              </div>
            </CardContent>
          )}

          {/* Clause list for non-form annexures */}
          {annexure.annexure_type === 'non-form' && (
            <CardContent>
              <NormalCircularClausesList
                clauses={annexure.clauses || []}
                circularName={annexure.annexure_title}
                onAddClause={(parentClausePath) => onAddClause?.(index, annexure, parentClausePath)}
                onEditClause={() => {}}
                onDeleteClause={() => {}}
              />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
} 