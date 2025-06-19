'use client';

import { CircularType } from '../types/masterCircular';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CircularSelectionProps {
  selectedCircular: CircularType;
  onCircularChange: (circular: CircularType) => void;
  stats: {
    chaptersCount: number;
    clausesCount: number;
    annexuresCount: number;
  };
}

export function CircularSelection({ selectedCircular, onCircularChange, stats }: CircularSelectionProps) {
  const circulars: { type: CircularType; label: string; description: string }[] = [
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {circulars.map((circular) => (
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
  );
} 