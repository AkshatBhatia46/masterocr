"use client";

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
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Clause } from "../types/masterCircular";

export const transformText = (text: string) => {
  const chunks = text.split("\n\n");

  let newTxt = "";

  // Patterns for list markers: decimal (e.g., 6.1, 6.1.2), numeric (e.g., 1., 1), and alphabetic (e.g., a., a))
  const decimalListPattern = /^\d+(?:\.\d+)+(?:\.|\))?$/;
  const numericListPattern = /^\d+(?:\.|\))?$/;
  const romanListPattern = /^[ivxlcdm]+(?:\.|\))$/i;
  const alphaListPattern = /^[a-zA-Z](?:\.|\))$/;

  for (let chunk of chunks) {
    const smallChunks = chunk.split("\n");
    for (let smallChunk of smallChunks) {
      const words = smallChunk.split(" ");
      // Handle nested markdown lists: '-' becomes '- -'
      if (words[0] === "-") {
        words[0] = "- -";
      } else if (
        decimalListPattern.test(words[0]) ||
        romanListPattern.test(words[0]) ||
        alphaListPattern.test(words[0])
      ) {
        // Nested decimal list (e.g., 6.1, 6.1.2)
        words[0] = `- - **${words[0]}**`;
      } else if (numericListPattern.test(words[0])) {
        // Generalized list marker formatting
        words[0] = `- **${words[0]}**`;
      }
      newTxt += words.join(" ") + "\n";
    }

    newTxt += "\n\n";
  }

  return newTxt
    .replaceAll("|\n|", "|table|")
    .replaceAll("\n\n", "|newLine|")
    .replaceAll("\n", "\n\n")
    .replaceAll("|newLine|", "\n\n")
    .replaceAll("|table|", "|\n|");
};

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
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set()
  );

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const renderClause = (
    clause: Clause,
    clausePath: string[],
    level: number = 0
  ) => {
    const clauseId = clausePath.join(".");
    const isExpanded = expandedClauses.has(clauseId);
    const hasSubclauses = clause.clauses && clause.clauses.length > 0;

    return (
      <div key={clauseId} className={level > 0 ? "ml-6 mt-2" : "mt-4"}>
        <Card className={level === 0 ? "border-l-4 border-l-blue-500" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                {hasSubclauses && (
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleClause(clauseId)}
                  >
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
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                        components={{
                          // Preserve existing table styling
                          table: ({ children }) => (
                            <table className="w-full border-collapse my-4 overflow-hidden">
                              {children}
                            </table>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-neutral-50">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-semibold bg-neutral-50">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-neutral-200 px-4 py-2 text-sm">
                              {children}
                            </td>
                          ),
                          // Update heading components to better handle ## headers
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold my-4">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => {
                            // Check if it's a numbered heading
                            const text = String(children);
                            const match = text.match(/^(\d+\.?\s*)(.*)/);

                            if (match) {
                              return (
                                <h2 className="text-base font-bold my-3">
                                  <span className="text-neutral-700">
                                    {match[1]}
                                  </span>
                                  {match[2]}
                                </h2>
                              );
                            }

                            return (
                              <h2 className="text-base font-bold my-3">
                                {children}
                              </h2>
                            );
                          },
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold my-2">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-vs font-bold my-2">
                              {children}
                            </h4>
                          ),
                          h5: ({ children }) => (
                            <h5 className="text-xs font-bold my-2">
                              {children}
                            </h5>
                          ),

                          li: ({ children }) => {
                            return (
                              <li className="pl-4 py-1 text-vs">{children}</li>
                            );
                          },
                          // Update paragraph component to handle our custom sebi-logo tag
                          p: ({ children }) => {
                            const content = String(children);
                            if (content.includes("<sebi-logo />")) {
                              return (
                                <div className="flex justify-center my-4">
                                  <img
                                    src="/sebi-logo.png"
                                    alt="SEBI Logo"
                                    className="h-16 w-auto"
                                  />
                                </div>
                              );
                            }
                            return <p className="my-2 text-vs">{children}</p>;
                          },
                          // Custom handling for figure tags that might contain SEBI logo markers
                          figure: ({ children }) => {
                            const content = String(children);
                            if (content.toLowerCase().includes("sz31")) {
                              return (
                                <div className="flex justify-center my-4">
                                  <img
                                    src="/sebi-logo.png"
                                    alt="SEBI Logo"
                                    className="h-16 w-auto"
                                  />
                                </div>
                              );
                            }
                            return <figure>{children}</figure>;
                          },
                          img: ({ node, ...props }: any) => {
                            // Added :any to props for now
                            const src = props.src as string;
                            return (
                              <img
                                {...props}
                                className="max-w-full h-auto my-2 mx-auto block object-contain"
                              />
                            );
                          },
                          a: ({ children, ...props }: any) => {
                            return (
                              <a {...props} className="text-blue-600 underline">
                                {children}
                              </a>
                            );
                          },
                          u: ({ children, ...props }: any) => {
                            return (
                              <u {...props} className="underline">
                                {children}
                              </u>
                            );
                          },
                          // Replace custom math components with proper HTML elements that rehype-katex generates
                          div: (props) => {
                            const { className, ...rest } = props;
                            // Check if this is a math block generated by rehype-katex
                            if (
                              className?.includes("math") &&
                              className?.includes("math-display")
                            ) {
                              return (
                                <div
                                  {...rest}
                                  className={`${className} my-2 text-center`}
                                />
                              );
                            }
                            return <div {...props} />;
                          },
                          span: (props) => {
                            const { className, ...rest } = props;
                            // Check if this is an inline math expression generated by rehype-katex
                            if (
                              className?.includes("math") &&
                              className?.includes("math-inline")
                            ) {
                              return (
                                <span
                                  {...rest}
                                  className={`${className} text-current`}
                                />
                              );
                            }
                            return <span {...props} />;
                          },
                        }}
                      >
                        {transformText(clause.clause_content || "")}
                      </ReactMarkdown>
                    </CardDescription>
                  )}
                </div>
              </div>

              <div className="flex items-center">
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
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleClause(clauseId)}
            >
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-2">
                    {clause.clauses?.map((subClause) =>
                      renderClause(
                        subClause,
                        [...clausePath, subClause.clause_number],
                        level + 1
                      )
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
            {clauses.length} clause{clauses.length !== 1 ? "s" : ""} in{" "}
            {circularName}
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
