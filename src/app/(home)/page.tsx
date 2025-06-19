"use client";

import Loader from "@/components/Loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, FileText, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { AddAnnexureForm } from "./components/AddAnnexureForm";
import { AddChapterForm } from "./components/AddChapterForm";
import { AddClauseForm } from "./components/AddClauseForm";
import { AnnexuresList } from "./components/AnnexuresList";
import { ChaptersList } from "./components/ChaptersList";
import { CircularSelection } from "./components/CircularSelection";
import { EditChapterForm } from "./components/EditChapterForm";
import { EditClauseForm } from "./components/EditClauseForm";
import { useMasterCircularData } from "./hooks/useMasterCircularData";
import { CircularType } from "./types/masterCircular";

export default function MasterCircularUploadPage() {
  const [selectedCircular, setSelectedCircular] =
    useState<CircularType>("2023");
  const [activeTab, setActiveTab] = useState<"chapters" | "annexures">(
    "chapters"
  );
  const [showAddChapterForm, setShowAddChapterForm] = useState(false);
  const [showAddAnnexureForm, setShowAddAnnexureForm] = useState(false);
  const [showAddClauseForm, setShowAddClauseForm] = useState(false);
  const [showEditChapterForm, setShowEditChapterForm] = useState(false);
  const [showEditClauseForm, setShowEditClauseForm] = useState(false);
  const [selectedChapterForClause, setSelectedChapterForClause] = useState<{
    index: number;
    chapter: any;
    parentClausePath?: string[];
  } | null>(null);
  const [selectedChapterForEdit, setSelectedChapterForEdit] = useState<{
    index: number;
    chapter: any;
  } | null>(null);
  const [selectedClauseForEdit, setSelectedClauseForEdit] = useState<{
    chapterIndex: number;
    chapter: any;
    clause: any;
    clausePath: string[];
  } | null>(null);

  const {
    data,
    loading,
    error,
    addChapter,
    updateChapter,
    deleteChapter,
    addClause,
    updateClause,
    deleteClause,
    addAnnexure,
    getStats,
    exportData,
    importData,
    clearAllData,
  } = useMasterCircularData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = data
    ? getStats(selectedCircular)
    : { chaptersCount: 0, clausesCount: 0, annexuresCount: 0 };
  const currentCircularData =
    data?.[`master_circular_${selectedCircular}` as keyof typeof data];

  const handleExportData = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master_circular_data_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = importData(content);
        if (success) {
          alert("Data imported successfully!");
        } else {
          alert("Failed to import data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddClause = (
    chapterIndex: number,
    chapter: any,
    parentClausePath?: string[]
  ) => {
    setSelectedChapterForClause({
      index: chapterIndex,
      chapter,
      parentClausePath,
    });
    setShowAddClauseForm(true);
  };

  const handleEditChapter = (chapterIndex: number, chapter: any) => {
    setSelectedChapterForEdit({ index: chapterIndex, chapter });
    setShowEditChapterForm(true);
  };

  const handleDeleteChapter = (chapterIndex: number, chapterNumber: string) => {
    const success = deleteChapter(selectedCircular, chapterIndex);
    if (!success) {
      alert("Failed to delete chapter. Please try again.");
    }
  };

  const closeAddClauseForm = () => {
    setShowAddClauseForm(false);
    setSelectedChapterForClause(null);
  };

  const closeEditChapterForm = () => {
    setShowEditChapterForm(false);
    setSelectedChapterForEdit(null);
  };

  const handleEditClause = (
    chapterIndex: number,
    chapter: any,
    clause: any,
    clausePath: string[]
  ) => {
    setSelectedClauseForEdit({ chapterIndex, chapter, clause, clausePath });
    setShowEditClauseForm(true);
  };

  const handleDeleteClause = (chapterIndex: number, clausePath: string[]) => {
    const success = deleteClause(selectedCircular, chapterIndex, clausePath);
    if (!success) {
      alert("Failed to delete clause. Please try again.");
    }
  };

  const closeEditClauseForm = () => {
    setShowEditClauseForm(false);
    setSelectedClauseForEdit(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight">
              Master Circular Upload
            </h1>
            <p className="text-muted-foreground text-vs">
              Manage chapters, clauses, and annexures for master circulars
            </p>
          </div>

          {/* Data Management Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size={"sm"}
              onClick={handleExportData}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button variant="default" size={"sm"} className="gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            </div>
          </div>
        </div>

        {/* Circular Selection */}
        <CircularSelection
          selectedCircular={selectedCircular}
          onCircularChange={setSelectedCircular}
          stats={stats}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Chapters
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chaptersCount}</div>
            <p className="text-xs text-muted-foreground">
              in {selectedCircular} circular
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clauses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clausesCount}</div>
            <p className="text-xs text-muted-foreground">
              including subclauses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Annexures
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.annexuresCount}</div>
            <p className="text-xs text-muted-foreground">form and non-form</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Master Circular For Mutual Funds ({selectedCircular})
                <Badge variant="secondary">{selectedCircular}</Badge>
              </CardTitle>
              <CardDescription>
                Add and manage chapters, clauses, and annexures
              </CardDescription>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddChapterForm(true)}
                className="gap-2"
                disabled={activeTab !== "chapters"}
              >
                <Plus className="h-4 w-4" />
                Add Chapter
              </Button>
              <Button
                onClick={() => setShowAddAnnexureForm(true)}
                variant="outline"
                className="gap-2"
                disabled={activeTab !== "annexures"}
              >
                <Plus className="h-4 w-4" />
                Add Annexure
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "chapters" | "annexures")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chapters" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Chapters ({stats.chaptersCount})
              </TabsTrigger>
              <TabsTrigger value="annexures" className="gap-2">
                <FileText className="h-4 w-4" />
                Annexures ({stats.annexuresCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters" className="mt-6">
              <ChaptersList
                chapters={currentCircularData?.content || []}
                circularType={selectedCircular}
                onAddClause={handleAddClause}
                onEditChapter={handleEditChapter}
                onDeleteChapter={handleDeleteChapter}
                onEditClause={handleEditClause}
                onDeleteClause={handleDeleteClause}
              />
            </TabsContent>

            <TabsContent value="annexures" className="mt-6">
              <AnnexuresList
                annexures={currentCircularData?.annexures || []}
                circularType={selectedCircular}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddChapterForm && (
        <AddChapterForm
          circularType={selectedCircular}
          onClose={() => setShowAddChapterForm(false)}
          onAdd={addChapter}
        />
      )}

      {showAddAnnexureForm && (
        <AddAnnexureForm
          circularType={selectedCircular}
          onClose={() => setShowAddAnnexureForm(false)}
          onAdd={addAnnexure}
        />
      )}

      {showAddClauseForm && selectedChapterForClause && (
        <AddClauseForm
          circularType={selectedCircular}
          chapterIndex={selectedChapterForClause.index}
          chapterNumber={selectedChapterForClause.chapter.chapter_number}
          chapterTitle={selectedChapterForClause.chapter.chapter_title}
          parentClausePath={selectedChapterForClause.parentClausePath}
          onClose={closeAddClauseForm}
          onAdd={addClause}
        />
      )}

      {showEditChapterForm && selectedChapterForEdit && (
        <EditChapterForm
          circularType={selectedCircular}
          chapterIndex={selectedChapterForEdit.index}
          chapter={selectedChapterForEdit.chapter}
          onClose={closeEditChapterForm}
          onUpdate={updateChapter}
        />
      )}

      {showEditClauseForm && selectedClauseForEdit && (
        <EditClauseForm
          circularType={selectedCircular}
          chapterIndex={selectedClauseForEdit.chapterIndex}
          chapterNumber={selectedClauseForEdit.chapter.chapter_number}
          chapterTitle={selectedClauseForEdit.chapter.chapter_title}
          clause={selectedClauseForEdit.clause}
          clausePath={selectedClauseForEdit.clausePath}
          onClose={closeEditClauseForm}
          onUpdate={updateClause}
        />
      )}
    </div>
  );
}
