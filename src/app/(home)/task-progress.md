# Master Circular Upload Page - Development Plan

## Project Overview
Build an internal page for manually adding chapters, clauses, and annexures to master circulars (2023 & 2024) with local storage persistence.

## Phase 1: Setup & Infrastructure

### 1.1 Type Definitions
- [x] Create TypeScript interfaces for master circular data structure
  - `MasterCircularData` interface
  - `Chapter` interface  
  - `Clause` interface (with recursive nesting)
  - `Annexure` interface
  - `CircularType` enum ('2023' | '2024')

### 1.2 Local Storage Service
- [x] Create `LocalStorageService` utility class
  - `getMasterCircularData()` - fetch existing data
  - `saveMasterCircularData(data)` - save updated data
  - `initializeEmptyStructure()` - create default JSON structure
  - Error handling for localStorage operations

### 1.3 Custom Hooks
- [x] `useMasterCircularData` hook
  - State management for current circular data
  - Auto-load from localStorage on mount
  - Auto-save on data changes (debounced)
- [ ] `useCircularNavigation` hook
  - Handle navigation within chapters/clauses
  - Breadcrumb state management

## Phase 2: Core Components

### 2.1 Main Page Component (`page.tsx`)
- [x] Master circular selection dropdown/toggle
- [x] Current circular display
- [x] Main action buttons (Add Chapter, Add Annexure)
- [x] Data summary statistics
- [x] Export/Import JSON functionality

### 2.2 Circular Selection Component
- [x] Radio buttons or dropdown for circular selection
- [x] Visual indication of selected circular
- [x] Switch between 2023 and 2024 circulars
- [x] Show data count for each circular

### 2.3 Chapter Management Components

#### ChaptersList Component
- [x] Display all chapters for selected circular
- [x] Chapter cards with expand/collapse functionality
- [x] Quick actions (Edit, Delete, Add Clause)
- [ ] Drag & drop reordering (future enhancement)

#### AddChapterForm Component
- [x] Modal/slide-over form
- [x] Fields: Chapter Number, Chapter Title
- [x] Form validation
- [x] Submit handler to add chapter to data structure

#### ChapterDetailView Component
- [ ] Breadcrumb navigation
- [ ] Chapter header with edit functionality
- [ ] List of clauses in the chapter
- [ ] Add clause button

### 2.4 Clause Management Components

#### ClausesList Component
- [ ] Hierarchical display of clauses and subclauses
- [ ] Indentation for nested levels
- [ ] Expand/collapse for parent clauses
- [ ] Quick actions (Edit, Delete, Add Subclause)

#### AddClauseForm Component
- [ ] Modal form for adding clauses
- [ ] Fields: Clause Number, Clause Title, Image Upload
- [ ] Parent clause selection for subclauses
- [ ] Image preview before upload
- [ ] Placeholder for future OCR integration

#### ClauseCard Component
- [ ] Individual clause display
- [ ] Nested structure visualization
- [ ] Action buttons (Edit, Delete, Add Subclause)
- [ ] Content preview (when available)

### 2.5 Annexure Management Components

#### AnnexuresList Component
- [x] Display all annexures for selected circular
- [x] Annexure type indicators (Form/Non-Form)
- [x] Quick actions (Edit, Delete)

#### AddAnnexureForm Component
- [x] Modal form with annexure type selection
- [x] Radio buttons: "Non Form Annexures" / "Form Annexures"
- [x] Fields: Annexure Title, Image Upload
- [x] Type-specific form adjustments
- [x] Image preview functionality

## Phase 3: Advanced Features

### 3.1 Navigation & Breadcrumbs
- [ ] BreadcrumbNavigation component
- [ ] Deep linking within chapters/clauses
- [ ] Back/Forward navigation
- [ ] Current location indicator

### 3.2 Data Validation & Error Handling
- [ ] Form validation schemas (using Zod)
- [ ] Duplicate number detection
- [ ] Required field validation
- [ ] Error toast notifications
- [ ] Data integrity checks

### 3.3 Search & Filter
- [ ] Search across chapters and clauses
- [ ] Filter by chapter/clause type
- [ ] Quick jump to specific items
- [ ] Search highlighting

### 3.4 Data Management
- [ ] Bulk operations (Delete multiple items)
- [ ] Copy/Move clauses between chapters
- [ ] Duplicate chapter/clause functionality
- [ ] Data export in different formats

## Phase 4: UI/UX Enhancements

### 4.1 Layout & Design
- [ ] Responsive design for different screen sizes
- [ ] Consistent spacing and typography
- [ ] Loading states for all operations
- [ ] Empty states with helpful guidance

### 4.2 Accessibility
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus management in modals
- [ ] Color contrast compliance

### 4.3 User Experience
- [ ] Confirmation dialogs for destructive actions
- [ ] Auto-save indicators
- [ ] Progress indicators for multi-step forms
- [ ] Undo/Redo functionality (future)

## Phase 5: Testing & Quality Assurance

### 5.1 Unit Testing
- [ ] Test utility functions (localStorage service)
- [ ] Test custom hooks
- [ ] Test component logic
- [ ] Test form validation

### 5.2 Integration Testing
- [ ] Test complete user workflows
- [ ] Test data persistence
- [ ] Test navigation flows
- [ ] Test error scenarios

### 5.3 Performance Testing
- [ ] Test with large datasets
- [ ] Memory leak detection
- [ ] Render performance optimization
- [ ] Bundle size analysis

## Phase 6: Future Enhancements

### 6.1 OCR Integration
- [ ] Image processing service integration
- [ ] OCR result preview and editing
- [ ] Confidence score display
- [ ] Manual correction interface

### 6.2 Collaboration Features
- [ ] Multiple user support
- [ ] Change tracking
- [ ] Comments and notes
- [ ] Version history

### 6.3 Advanced Data Management
- [ ] Database integration (replace localStorage)
- [ ] Backup and restore functionality
- [ ] Data synchronization
- [ ] Audit trail

## Technical Stack & Best Practices

### Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + useReducer
- **Storage**: LocalStorage (Phase 1), Database (Future)

### Code Quality Standards
- [ ] Follow React best practices
- [ ] Implement proper error boundaries
- [ ] Use TypeScript strict mode
- [ ] Implement proper loading states
- [ ] Follow component composition patterns
- [ ] Use proper prop drilling alternatives