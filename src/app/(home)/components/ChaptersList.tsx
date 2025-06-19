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
import {
    ChevronDown,
    ChevronRight,
    Edit,
    FileText,
    Plus,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { Chapter, CircularType, Clause } from "../types/masterCircular";

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

interface ChaptersListProps {
  chapters: Chapter[];
  circularType: CircularType;
  onAddClause?: (
    chapterIndex: number,
    chapter: Chapter,
    parentClausePath?: string[]
  ) => void;
  onEditChapter?: (chapterIndex: number, chapter: Chapter) => void;
  onDeleteChapter?: (chapterIndex: number, chapterNumber: string) => void;
  onEditClause?: (
    chapterIndex: number,
    chapter: Chapter,
    clause: Clause,
    clausePath: string[]
  ) => void;
  onDeleteClause?: (chapterIndex: number, clausePath: string[]) => void;
}

interface ClauseItemProps {
  clause: Clause;
  chapterIndex: number;
  chapter: Chapter;
  clausePath: string[];
  depth: number;
  onAddClause?: (
    chapterIndex: number,
    chapter: Chapter,
    parentClausePath?: string[]
  ) => void;
  onEditClause?: (
    chapterIndex: number,
    chapter: Chapter,
    clause: Clause,
    clausePath: string[]
  ) => void;
  onDeleteClause?: (chapterIndex: number, clausePath: string[]) => void;
}

function ClauseItem({
  clause,
  chapterIndex,
  chapter,
  clausePath,
  depth,
  onAddClause,
  onEditClause,
  onDeleteClause,
}: ClauseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubclauses = clause.clauses && clause.clauses.length > 0;
  const indentLevel = depth * 20;

  const handleAddSubclause = () => {
    onAddClause?.(chapterIndex, chapter, clausePath);
  };

  const handleEditClause = () => {
    onEditClause?.(chapterIndex, chapter, clause, clausePath);
  };

  const handleDeleteClause = () => {
    if (
      confirm(
        `Are you sure you want to delete clause ${clause.clause_number}? This will also delete all its subclauses.`
      )
    ) {
      onDeleteClause?.(chapterIndex, clausePath);
    }
  };

  return (
    <div
      className="border rounded-lg"
      style={{ marginLeft: `${indentLevel}px` }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasSubclauses && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasSubclauses && <div className="w-5" />}

            <Badge
              variant={depth === 0 ? "secondary" : "outline"}
              className="text-xs"
            >
              {clause.clause_number}
            </Badge>

            {clause.clause_title && (
              <span className="font-medium text-sm">{clause.clause_title}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleAddSubclause}
              title="Add subclause"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleEditClause}
              title="Edit clause"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={handleDeleteClause}
              title="Delete clause"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {clause.clause_content && (
          <div className="mt-2 pl-7">
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
                  <h1 className="text-lg font-bold my-4">{children}</h1>
                ),
                h2: ({ children }) => {
                  // Check if it's a numbered heading
                  const text = String(children);
                  const match = text.match(/^(\d+\.?\s*)(.*)/);

                  if (match) {
                    return (
                      <h2 className="text-base font-bold my-3">
                        <span className="text-neutral-700">{match[1]}</span>
                        {match[2]}
                      </h2>
                    );
                  }

                  return (
                    <h2 className="text-base font-bold my-3">{children}</h2>
                  );
                },
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold my-2">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-vs font-bold my-2">{children}</h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-xs font-bold my-2">{children}</h5>
                ),

                li: ({ children }) => {
                  return <li className="pl-4 py-1 text-vs">{children}</li>;
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
                      <span {...rest} className={`${className} text-current`} />
                    );
                  }
                  return <span {...props} />;
                },
              }}
            >
              {transformText(clause.clause_content || "")}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Nested subclauses */}
      {hasSubclauses && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="pl-4 pb-3 space-y-2">
              {clause.clauses!.map((subclause, subIndex) => (
                <ClauseItem
                  key={`${subclause.clause_number}-${subIndex}`}
                  clause={subclause}
                  chapterIndex={chapterIndex}
                  chapter={chapter}
                  clausePath={[...clausePath, subclause.clause_number]}
                  depth={depth + 1}
                  onAddClause={onAddClause}
                  onEditClause={onEditClause}
                  onDeleteClause={onDeleteClause}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function ChaptersList({
  chapters,
  circularType,
  onAddClause,
  onEditChapter,
  onDeleteChapter,
  onEditClause,
  onDeleteClause,
}: ChaptersListProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  const toggleChapter = (chapterNumber: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNumber)) {
      newExpanded.delete(chapterNumber);
    } else {
      newExpanded.add(chapterNumber);
    }
    setExpandedChapters(newExpanded);
  };

  const handleDeleteChapter = (chapterIndex: number, chapterNumber: string) => {
    if (
      confirm(
        `Are you sure you want to delete Chapter ${chapterNumber}? This will also delete all its clauses.`
      )
    ) {
      onDeleteChapter?.(chapterIndex, chapterNumber);
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No chapters yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding your first chapter to the {circularType} circular.
        </p>
        <p className="text-sm text-muted-foreground">
          Click the "Add Chapter" button above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <Card key={`${chapter.chapter_number}-${index}`} className="border">
          <Collapsible
            open={expandedChapters.has(chapter.chapter_number)}
            onOpenChange={() => toggleChapter(chapter.chapter_number)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {expandedChapters.has(chapter.chapter_number) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {chapter.chapter_number}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {chapter.chapter_title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {chapter.clauses.length} clause
                        {chapter.clauses.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        onAddClause?.(index, chapter);
                      }}
                      title="Add clause"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        onEditChapter?.(index, chapter);
                      }}
                      title="Edit chapter"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() =>
                        handleDeleteChapter(index, chapter.chapter_number)
                      }
                      title="Delete chapter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                {chapter.chapter_content && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
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
                          <h1 className="text-lg font-bold my-4">{children}</h1>
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
                          <h3 className="text-sm font-bold my-2">{children}</h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-vs font-bold my-2">{children}</h4>
                        ),
                        h5: ({ children }) => (
                          <h5 className="text-xs font-bold my-2">{children}</h5>
                        ),

                        li: ({ children }) => {
                          return <li className="pl-4 py-1 text-vs">{children}</li>;
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
                      {transformText(chapter.chapter_content || "")}
                    </ReactMarkdown>
                  </div>
                )}

                {chapter.clauses.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No clauses in this chapter yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        onAddClause?.(index, chapter);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add First Clause
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chapter.clauses.map((clause, clauseIndex) => (
                      <ClauseItem
                        key={`${clause.clause_number}-${clauseIndex}`}
                        clause={clause}
                        chapterIndex={index}
                        chapter={chapter}
                        clausePath={[clause.clause_number]}
                        depth={0}
                        onAddClause={onAddClause}
                        onEditClause={onEditClause}
                        onDeleteClause={onDeleteClause}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}
