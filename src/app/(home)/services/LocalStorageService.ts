import { MasterCircularData, CircularType, Chapter, Clause, Annexure } from '../types/masterCircular';

const STORAGE_KEY = 'master_circular_data';

class LocalStorageService {
  private getDefaultStructure(): MasterCircularData {
    return {
      master_circular_2023: {
        content: [],
        annexures: []
      },
      master_circular_2024: {
        content: [],
        annexures: []
      }
    };
  }

  getMasterCircularData(): MasterCircularData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const defaultData = this.getDefaultStructure();
        this.saveMasterCircularData(defaultData);
        return defaultData;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getDefaultStructure();
    }
  }

  saveMasterCircularData(data: MasterCircularData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  addChapter(circularType: CircularType, chapter: Chapter): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      // Check for duplicate chapter numbers
      const exists = data[circularKey].content.some(
        c => c.chapter_number === chapter.chapter_number
      );
      
      if (exists) {
        throw new Error(`Chapter ${chapter.chapter_number} already exists`);
      }
      
      data[circularKey].content.push(chapter);
      return this.saveMasterCircularData(data);
    } catch (error) {
      console.error('Error adding chapter:', error);
      return false;
    }
  }

  updateChapter(circularType: CircularType, chapterIndex: number, chapter: Chapter): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data[circularKey].content.length) {
        data[circularKey].content[chapterIndex] = chapter;
        return this.saveMasterCircularData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating chapter:', error);
      return false;
    }
  }

  deleteChapter(circularType: CircularType, chapterIndex: number): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data[circularKey].content.length) {
        data[circularKey].content.splice(chapterIndex, 1);
        return this.saveMasterCircularData(data);
      }
      return false;
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return false;
    }
  }

  addClauseToChapter(
    circularType: CircularType, 
    chapterIndex: number, 
    clause: Clause, 
    parentClausePath?: string[]
  ): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data[circularKey].content.length) {
        const chapter = data[circularKey].content[chapterIndex];
        
        if (!parentClausePath || parentClausePath.length === 0) {
          // Add to chapter root
          chapter.clauses.push(clause);
        } else {
          // Add to nested clause
          const parentClause = this.findClauseByPath(chapter.clauses, parentClausePath);
          if (parentClause) {
            if (!parentClause.clauses) {
              parentClause.clauses = [];
            }
            parentClause.clauses.push(clause);
          } else {
            throw new Error('Parent clause not found');
          }
        }
        
        return this.saveMasterCircularData(data);
      }
      return false;
    } catch (error) {
      console.error('Error adding clause:', error);
      return false;
    }
  }

  addAnnexure(circularType: CircularType, annexure: Annexure): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      data[circularKey].annexures.push(annexure);
      return this.saveMasterCircularData(data);
    } catch (error) {
      console.error('Error adding annexure:', error);
      return false;
    }
  }

  deleteAnnexure(circularType: CircularType, annexureIndex: number): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (annexureIndex >= 0 && annexureIndex < data[circularKey].annexures.length) {
        data[circularKey].annexures.splice(annexureIndex, 1);
        return this.saveMasterCircularData(data);
      }
      return false;
    } catch (error) {
      console.error('Error deleting annexure:', error);
      return false;
    }
  }

  private findClauseByPath(clauses: Clause[], path: string[]): Clause | null {
    let current = clauses;
    let targetClause: Clause | null = null;
    
    for (const clauseNumber of path) {
      targetClause = current.find(c => c.clause_number === clauseNumber) || null;
      if (!targetClause) return null;
      current = targetClause.clauses || [];
    }
    
    return targetClause;
  }

  exportData(): string {
    const data = this.getMasterCircularData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as MasterCircularData;
      // Basic validation
      if (!data.master_circular_2023 || !data.master_circular_2024) {
        throw new Error('Invalid data structure');
      }
      return this.saveMasterCircularData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  deleteClause(
    circularType: CircularType, 
    chapterIndex: number, 
    clausePath: string[]
  ): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data[circularKey].content.length) {
        const chapter = data[circularKey].content[chapterIndex];
        
        if (clausePath.length === 1) {
          // Delete root level clause
          const clauseIndex = chapter.clauses.findIndex(c => c.clause_number === clausePath[0]);
          if (clauseIndex !== -1) {
            chapter.clauses.splice(clauseIndex, 1);
            return this.saveMasterCircularData(data);
          }
        } else {
          // Delete nested clause
          const parentClause = this.findClauseByPath(chapter.clauses, clausePath.slice(0, -1));
          if (parentClause && parentClause.clauses) {
            const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
            if (clauseIndex !== -1) {
              parentClause.clauses.splice(clauseIndex, 1);
              return this.saveMasterCircularData(data);
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting clause:', error);
      return false;
    }
  }

  updateClause(
    circularType: CircularType, 
    chapterIndex: number, 
    clausePath: string[],
    updatedClause: Clause
  ): boolean {
    try {
      const data = this.getMasterCircularData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data[circularKey].content.length) {
        const chapter = data[circularKey].content[chapterIndex];
        
        if (clausePath.length === 1) {
          // Update root level clause
          const clauseIndex = chapter.clauses.findIndex(c => c.clause_number === clausePath[0]);
          if (clauseIndex !== -1) {
            chapter.clauses[clauseIndex] = updatedClause;
            return this.saveMasterCircularData(data);
          }
        } else {
          // Update nested clause
          const parentClause = this.findClauseByPath(chapter.clauses, clausePath.slice(0, -1));
          if (parentClause && parentClause.clauses) {
            const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
            if (clauseIndex !== -1) {
              parentClause.clauses[clauseIndex] = updatedClause;
              return this.saveMasterCircularData(data);
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating clause:', error);
      return false;
    }
  }

  getDataStats(circularType: CircularType) {
    const data = this.getMasterCircularData();
    const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
    const circular = data[circularKey];
    
    const countClauses = (clauses: Clause[]): number => {
      return clauses.reduce((count, clause) => {
        return count + 1 + (clause.clauses ? countClauses(clause.clauses) : 0);
      }, 0);
    };
    
    const totalClauses = circular.content.reduce((total, chapter) => {
      return total + countClauses(chapter.clauses);
    }, 0);
    
    return {
      chaptersCount: circular.content.length,
      clausesCount: totalClauses,
      annexuresCount: circular.annexures.length
    };
  }
}

export const localStorageService = new LocalStorageService(); 