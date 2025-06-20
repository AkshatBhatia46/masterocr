'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Clause } from "../types/masterCircular";

interface NormalCircularClausesListProps {
  clauses: Clause[];
  circularName: string;
  onAddClause: (parentClausePath?: string[]) => void;
  onEditClause: (clause: any, clausePath: string[]) => void;
  onDeleteClause: (clausePath: string[]) => void;
}

export function NormalCircularClausesList({
  clauses,
  circularName,
  onAddClause,
  onEditClause,
  onDeleteClause,
}: NormalCircularClausesListProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const renderClause = (clause: Clause, clausePath: string[], level: number = 0) => {
    const clauseId = clausePath.join('.');
    const isExpanded = expandedClauses.has(clauseId);
    const hasSubclauses = clause.clauses && clause.clauses.length > 0;

    return (
      <div key={clauseId} className={level > 0 ? "ml-6 mt-2" : "mt-4"}>
        <Card className={level === 0 ? "border-l-4 border-l-blue-500" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasSubclauses && (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleClause(clauseId)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                )}
                <div>
                  <CardTitle className="text-base">
                    <Badge variant="outline" className="mr-2">
                      {clause.clause_number}
                    </Badge>
                    {clause.clause_title}
                  </CardTitle>
                  {clause.clause_content && (
                    <CardDescription className="mt-1">
                      {clause.clause_content}
                    </CardDescription>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddClause(clausePath)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditClause(clause, clausePath)}
                  className="gap-1"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClause(clausePath)}
                  className="gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {hasSubclauses && (
            <Collapsible open={isExpanded} onOpenChange={() => toggleClause(clauseId)}>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-2">
                    {clause.clauses?.map((subClause) =>
                      renderClause(subClause, [...clausePath, subClause.clause_number], level + 1)
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Card>
      </div>
    );
  };

  if (clauses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            No clauses found for {circularName}. Add your first clause.
          </p>
          <Button onClick={() => onAddClause()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Clause
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Clauses</h3>
          <p className="text-sm text-muted-foreground">
            {clauses.length} clause{clauses.length !== 1 ? 's' : ''} in {circularName}
          </p>
        </div>
        <Button onClick={() => onAddClause()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Clause
        </Button>
      </div>

      <div className="space-y-2">
        {clauses.map((clause) =>
          renderClause(clause, [clause.clause_number], 0)
        )}
      </div>
    </div>
  );
} 