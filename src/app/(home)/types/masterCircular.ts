export type CircularType = '2023' | '2024';

// New types for normal circulars
export type CircularMode = 'master' | 'normal';

export interface Clause {
  clause_number: string;
  clause_title: string;
  clause_content: string;
  clauses?: Clause[];
}

export interface Chapter {
  chapter_number: string;
  chapter_title: string;
  chapter_content?: string;
  clauses: Clause[];
}

export interface Annexure {
  annexure_title: string;
  annexure_content: string;
  annexure_type?: 'form' | 'non-form';
}

export interface CircularContent {
  content: Chapter[];
  annexures: Annexure[];
}

// New interface for normal circular content (no chapters, just clauses)
export interface NormalCircularContent {
  clauses: Clause[];
  annexures: Annexure[];
}

export interface MasterCircularData {
  master_circular_2023: CircularContent;
  master_circular_2024: CircularContent;
}

// New interface for normal circulars data
export interface NormalCircularsData {
  [circularName: string]: NormalCircularContent;
}

// Combined data structure
export interface AllCircularsData {
  master_circulars: MasterCircularData;
  normal_circulars: NormalCircularsData;
}

export interface NavigationState {
  currentChapter?: string;
  currentClausePath?: string[];
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  type: 'circular' | 'chapter' | 'clause';
  id: string;
}

// Form data interfaces
export interface ChapterFormData {
  chapter_number: string;
  chapter_title: string;
}

export interface ClauseFormData {
  clause_number: string;
  clause_title: string;
  image?: File;
  parentClausePath?: string[];
}

export interface AnnexureFormData {
  annexure_title: string;
  annexure_type: 'form' | 'non-form';
  image?: File;
}

// New interface for normal circular form
export interface NormalCircularFormData {
  circular_name: string;
} 