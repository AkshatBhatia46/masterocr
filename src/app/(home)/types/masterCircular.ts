export type CircularType = '2023' | '2024';

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

export interface MasterCircularData {
  master_circular_2023: CircularContent;
  master_circular_2024: CircularContent;
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