"use client";

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
import { AddNormalCircularForm } from "./components/AddNormalCircularForm";
import { AnnexuresList } from "./components/AnnexuresList";
import { ChaptersList } from "./components/ChaptersList";
import { CircularSelection } from "./components/CircularSelection";
import { EditChapterForm } from "./components/EditChapterForm";
import { EditClauseForm } from "./components/EditClauseForm";
import { NormalCircularClausesList } from "./components/NormalCircularClausesList";
import { useCircularData } from "./hooks/useMasterCircularData";
import { CircularType, CircularMode } from "./types/masterCircular";

export default function MasterCircularUploadPage() {
  const [circularMode, setCircularMode] = useState<CircularMode>("master");
  const [selectedCircular, setSelectedCircular] = useState<CircularType | string>("2023");
  const [activeTab, setActiveTab] = useState<"chapters" | "annexures">("chapters");
  
  // Form states
  const [showAddChapterForm, setShowAddChapterForm] = useState(false);
  const [showAddAnnexureForm, setShowAddAnnexureForm] = useState(false);
  const [showAddClauseForm, setShowAddClauseForm] = useState(false);
  const [showEditChapterForm, setShowEditChapterForm] = useState(false);
  const [showEditClauseForm, setShowEditClauseForm] = useState(false);
  const [showAddNormalCircularForm, setShowAddNormalCircularForm] = useState(false);
  
  // Selection states
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
    // Normal circular methods
    getNormalCircularNames,
    addNormalCircular,
    deleteNormalCircular,
    addClauseToNormalCircular,
    updateClauseInNormalCircular,
    deleteClauseFromNormalCircular,
    addAnnexureToNormalCircular,
    deleteAnnexureFromNormalCircular,
    // Master circular methods
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
  } = useCircularData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
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

  const normalCirculars = getNormalCircularNames();
  const stats = data ? getStats(selectedCircular, circularMode) : { chaptersCount: 0, clausesCount: 0, annexuresCount: 0 };
  
  // Get current data based on mode
  const getCurrentData = () => {
    if (!data) return null;
    
    if (circularMode === 'master') {
      const masterData = data.master_circulars[`master_circular_${selectedCircular}` as keyof typeof data.master_circulars];
      return masterData;
    } else {
      const normalData = data.normal_circulars[selectedCircular as string];
      return normalData;
    }
  };

  const currentData = getCurrentData();

  const handleModeChange = (mode: CircularMode) => {
    setCircularMode(mode);
    // Reset to first available circular when switching modes
    if (mode === 'master') {
      setSelectedCircular('2023');
    } else {
      const firstNormal = normalCirculars[0];
      if (firstNormal) {
        setSelectedCircular(firstNormal);
      }
    }
    setActiveTab('chapters');
  };

  const handleCircularChange = (circular: CircularType | string) => {
    setSelectedCircular(circular);
    setActiveTab('chapters');
  };

  const handleExportData = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all_circulars_data_${new Date().toISOString().split("T")[0]}.json`;
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

  // Master circular handlers
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
    const success = deleteChapter(selectedCircular as CircularType, chapterIndex);
    if (!success) {
      alert("Failed to delete chapter. Please try again.");
    }
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
    const success = deleteClause(selectedCircular as CircularType, chapterIndex, clausePath);
    if (!success) {
      alert("Failed to delete clause. Please try again.");
    }
  };

  // Normal circular handlers
  const handleAddNormalCircularClause = (parentClausePath?: string[]) => {
    // For normal circulars, we use -1 as chapterIndex since there are no chapters
    setSelectedChapterForClause({
      index: -1,
      chapter: null,
      parentClausePath,
    });
    setShowAddClauseForm(true);
  };

  const handleEditNormalCircularClause = (clause: any, clausePath: string[]) => {
    setSelectedClauseForEdit({
      chapterIndex: -1,
      chapter: null,
      clause,
      clausePath,
    });
    setShowEditClauseForm(true);
  };

  const handleDeleteNormalCircularClause = (clausePath: string[]) => {
    const success = deleteClauseFromNormalCircular(selectedCircular as string, clausePath);
    if (!success) {
      alert("Failed to delete clause. Please try again.");
    }
  };

  // Form close handlers
  const closeAddClauseForm = () => {
    setShowAddClauseForm(false);
    setSelectedChapterForClause(null);
  };

  const closeEditChapterForm = () => {
    setShowEditChapterForm(false);
    setSelectedChapterForEdit(null);
  };

  const closeEditClauseForm = () => {
    setShowEditClauseForm(false);
    setSelectedClauseForEdit(null);
  };

  const renderMainContent = () => {
    if (circularMode === 'normal' && normalCirculars.length === 0) {
      return null; // CircularSelection will handle the empty state
    }

    if (circularMode === 'normal' && !currentData) {
      return (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Please select a normal circular to manage its content.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {circularMode === 'master' ? (
                  <>
                    Master Circular For Mutual Funds ({selectedCircular})
                    <Badge variant="secondary">{selectedCircular}</Badge>
                  </>
                ) : (
                  <>
                    {selectedCircular}
                    <Badge variant="secondary">Normal</Badge>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {circularMode === 'master' 
                  ? 'Add and manage chapters, clauses, and annexures'
                  : 'Add and manage clauses and annexures (no chapters)'
                }
              </CardDescription>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {circularMode === 'master' && (
                <Button
                  onClick={() => setShowAddChapterForm(true)}
                  className="gap-2"
                  disabled={activeTab !== "chapters"}
                >
                  <Plus className="h-4 w-4" />
                  Add Chapter
                </Button>
              )}
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
                {circularMode === 'master' ? (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Chapters ({stats.chaptersCount})
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Clauses ({stats.clausesCount})
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger value="annexures" className="gap-2">
                <FileText className="h-4 w-4" />
                Annexures ({stats.annexuresCount})
              </TabsTrigger>
            </TabsList>

                         <TabsContent value="chapters" className="mt-6">
               {circularMode === 'master' ? (
                 <ChaptersList
                   chapters={(currentData as any)?.content || []}
                   circularType={selectedCircular as CircularType}
                   onAddClause={handleAddClause}
                   onEditChapter={handleEditChapter}
                   onDeleteChapter={handleDeleteChapter}
                   onEditClause={handleEditClause}
                   onDeleteClause={handleDeleteClause}
                 />
               ) : (
                 <NormalCircularClausesList
                   clauses={(currentData as any)?.clauses || []}
                   circularName={selectedCircular as string}
                   onAddClause={handleAddNormalCircularClause}
                   onEditClause={handleEditNormalCircularClause}
                   onDeleteClause={handleDeleteNormalCircularClause}
                 />
               )}
             </TabsContent>

                         <TabsContent value="annexures" className="mt-6">
               <AnnexuresList
                 annexures={currentData?.annexures || []}
                 circularType={circularMode === 'master' ? selectedCircular as CircularType : selectedCircular as string}
                 mode={circularMode}
               />
             </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight">
              Circular Management System
            </h1>
            <p className="text-muted-foreground text-vs">
              Manage master circulars and normal circulars with chapters, clauses, and annexures
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
          onCircularChange={handleCircularChange}
          circularMode={circularMode}
          onModeChange={handleModeChange}
          normalCirculars={normalCirculars}
          onAddNormalCircular={() => setShowAddNormalCircularForm(true)}
          stats={stats}
        />
      </div>

      {/* Statistics Cards */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {circularMode === 'master' && (
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
          )}

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
      )}

      {/* Main Content */}
      {renderMainContent()}

      {/* Modals */}
      {showAddNormalCircularForm && (
        <AddNormalCircularForm
          onClose={() => setShowAddNormalCircularForm(false)}
          onAdd={addNormalCircular}
          existingNames={normalCirculars}
        />
      )}

      {showAddChapterForm && circularMode === 'master' && (
        <AddChapterForm
          circularType={selectedCircular as CircularType}
          onClose={() => setShowAddChapterForm(false)}
          onAdd={addChapter}
        />
      )}

             {showAddAnnexureForm && (
         <AddAnnexureForm
           circularType={circularMode === 'master' ? selectedCircular as CircularType : selectedCircular as string}
           onClose={() => setShowAddAnnexureForm(false)}
           onAdd={(circularType: any, annexure: any) => {
             if (circularMode === 'master') {
               return addAnnexure(circularType, annexure);
             } else {
               return addAnnexureToNormalCircular(circularType, annexure);
             }
           }}
         />
       )}

       {showAddClauseForm && selectedChapterForClause && (
         <AddClauseForm
           circularType={circularMode === 'master' ? selectedCircular as CircularType : selectedCircular as string}
           chapterIndex={selectedChapterForClause.index}
           chapterNumber={selectedChapterForClause.chapter?.chapter_number || 'N/A'}
           chapterTitle={selectedChapterForClause.chapter?.chapter_title || selectedCircular as string}
           parentClausePath={selectedChapterForClause.parentClausePath}
           onClose={closeAddClauseForm}
           onAdd={(circularType: any, chapterIndex: number, clause: any, parentClausePath?: string[]) => {
             if (circularMode === 'master') {
               return addClause(circularType, chapterIndex, clause, parentClausePath);
             } else {
               return addClauseToNormalCircular(circularType, clause, parentClausePath);
             }
           }}
         />
       )}

       {showEditChapterForm && selectedChapterForEdit && circularMode === 'master' && (
         <EditChapterForm
           circularType={selectedCircular as CircularType}
           chapterIndex={selectedChapterForEdit.index}
           chapter={selectedChapterForEdit.chapter}
           onClose={closeEditChapterForm}
           onUpdate={updateChapter}
         />
       )}

       {showEditClauseForm && selectedClauseForEdit && (
         <EditClauseForm
           circularType={circularMode === 'master' ? selectedCircular as CircularType : selectedCircular as string}
           chapterIndex={selectedClauseForEdit.chapterIndex}
           chapterNumber={selectedClauseForEdit.chapter?.chapter_number || 'N/A'}
           chapterTitle={selectedClauseForEdit.chapter?.chapter_title || selectedCircular as string}
           clause={selectedClauseForEdit.clause}
           clausePath={selectedClauseForEdit.clausePath}
           onClose={closeEditClauseForm}
           onUpdate={(circularType: any, chapterIndex: number, clausePath: string[], clause: any) => {
             if (circularMode === 'master') {
               return updateClause(circularType, chapterIndex, clausePath, clause);
             } else {
               return updateClauseInNormalCircular(circularType, clausePath, clause);
             }
           }}
         />
       )}
    </div>
  );
}
