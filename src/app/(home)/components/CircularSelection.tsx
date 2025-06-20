'use client';

import { CircularType, CircularMode } from '../types/masterCircular';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface CircularSelectionProps {
  selectedCircular: CircularType | string;
  onCircularChange: (circular: CircularType | string) => void;
  circularMode: CircularMode;
  onModeChange: (mode: CircularMode) => void;
  normalCirculars: string[];
  onAddNormalCircular: () => void;
  stats: {
    chaptersCount: number;
    clausesCount: number;
    annexuresCount: number;
  };
}

export function CircularSelection({ 
  selectedCircular, 
  onCircularChange, 
  circularMode,
  onModeChange,
  normalCirculars,
  onAddNormalCircular,
  stats 
}: CircularSelectionProps) {
  const masterCirculars: { type: CircularType; label: string; description: string }[] = [
    {
      type: '2023',
      label: 'Master Circular For Mutual Funds (2023)',
      description: 'Previous version of the master circular'
    },
    {
      type: '2024',
      label: 'Master Circular For Mutual Funds (2024)',
      description: 'Current version of the master circular'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={circularMode === 'master' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('master')}
        >
          Master Circulars
        </Button>
        <Button
          variant={circularMode === 'normal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('normal')}
        >
          Normal Circulars
        </Button>
      </div>

      {/* Master Circulars */}
      {circularMode === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masterCirculars.map((circular) => (
            <Card 
              key={circular.type}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedCircular === circular.type 
                  ? "ring-2 ring-primary border-primary" 
                  : "border-border"
              )}
              onClick={() => onCircularChange(circular.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {circular.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {circular.description}
                    </p>
                  </div>
                  <div className="ml-2">
                    <Badge 
                      variant={selectedCircular === circular.type ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {circular.type}
                    </Badge>
                  </div>
                </div>
                
                {selectedCircular === circular.type && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                    <span>{stats.chaptersCount} chapters</span>
                    <span>{stats.clausesCount} clauses</span>
                    <span>{stats.annexuresCount} annexures</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Normal Circulars */}
      {circularMode === 'normal' && (
        <div className="space-y-4">
          {normalCirculars.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  No normal circulars found. Create your first normal circular.
                </p>
                <Button onClick={onAddNormalCircular} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Normal Circular
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Available Normal Circulars</h3>
                <Button onClick={onAddNormalCircular} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normalCirculars.map((circularName) => (
                  <Card 
                    key={circularName}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedCircular === circularName 
                        ? "ring-2 ring-primary border-primary" 
                        : "border-border"
                    )}
                    onClick={() => onCircularChange(circularName)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm leading-tight">
                            {circularName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Normal circular (no chapters)
                          </p>
                        </div>
                        <div className="ml-2">
                          <Badge 
                            variant={selectedCircular === circularName ? "default" : "secondary"}
                            className="text-xs"
                          >
                            Normal
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedCircular === circularName && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                          <span>{stats.clausesCount} clauses</span>
                          <span>{stats.annexuresCount} annexures</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 