import { 
  MasterCircularData, 
  CircularType, 
  Chapter, 
  Clause, 
  Annexure, 
  AllCircularsData,
  NormalCircularContent,
  CircularMode
} from '../types/masterCircular';

const STORAGE_KEY = 'all_circulars_data';

class LocalStorageService {
  private getDefaultStructure(): AllCircularsData {
    return {
      master_circulars: {
        master_circular_2023: {
          content: [],
          annexures: []
        },
        master_circular_2024: {
          content: [],
          annexures: []
        }
      },
      normal_circulars: {}
    };
  }

  getAllCircularsData(): AllCircularsData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const defaultData = this.getDefaultStructure();
        this.saveAllCircularsData(defaultData);
        return defaultData;
      }
      const parsedData = JSON.parse(data);
      
      // Migrate old data structure if needed
      if (parsedData.master_circular_2023 && !parsedData.master_circulars) {
        const migratedData: AllCircularsData = {
          master_circulars: {
            master_circular_2023: parsedData.master_circular_2023,
            master_circular_2024: parsedData.master_circular_2024
          },
          normal_circulars: {}
        };
        this.saveAllCircularsData(migratedData);
        return migratedData;
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getDefaultStructure();
    }
  }

  // Legacy method for backward compatibility
  getMasterCircularData(): MasterCircularData {
    const allData = this.getAllCircularsData();
    return allData.master_circulars;
  }

  saveAllCircularsData(data: AllCircularsData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Legacy method for backward compatibility
  saveMasterCircularData(data: MasterCircularData): boolean {
    const allData = this.getAllCircularsData();
    allData.master_circulars = data;
    return this.saveAllCircularsData(allData);
  }

  // Normal circular methods
  getNormalCircularNames(): string[] {
    const data = this.getAllCircularsData();
    return Object.keys(data.normal_circulars);
  }

  addNormalCircular(circularName: string): boolean {
    try {
      const data = this.getAllCircularsData();
      
      if (data.normal_circulars[circularName]) {
        throw new Error(`Normal circular "${circularName}" already exists`);
      }
      
      data.normal_circulars[circularName] = {
        clauses: [],
        annexures: []
      };
      
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error adding normal circular:', error);
      return false;
    }
  }

  deleteNormalCircular(circularName: string): boolean {
    try {
      const data = this.getAllCircularsData();
      
      if (!data.normal_circulars[circularName]) {
        return false;
      }
      
      delete data.normal_circulars[circularName];
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error deleting normal circular:', error);
      return false;
    }
  }

  // Normal circular clause methods
  addClauseToNormalCircular(
    circularName: string,
    clause: Clause,
    parentClausePath?: string[]
  ): boolean {
    try {
      const data = this.getAllCircularsData();
      const circular = data.normal_circulars[circularName];
      
      if (!circular) {
        throw new Error(`Normal circular "${circularName}" not found`);
      }
      
      if (!parentClausePath || parentClausePath.length === 0) {
        // Add to root
        circular.clauses.push(clause);
      } else {
        // Add to nested clause
        const parentClause = this.findClauseByPath(circular.clauses, parentClausePath);
        if (parentClause) {
          if (!parentClause.clauses) {
            parentClause.clauses = [];
          }
          parentClause.clauses.push(clause);
        } else {
          throw new Error('Parent clause not found');
        }
      }
      
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error adding clause to normal circular:', error);
      return false;
    }
  }

  updateClauseInNormalCircular(
    circularName: string,
    clausePath: string[],
    updatedClause: Clause
  ): boolean {
    try {
      const data = this.getAllCircularsData();
      const circular = data.normal_circulars[circularName];
      
      if (!circular) {
        return false;
      }
      
      if (clausePath.length === 1) {
        // Update root level clause
        const clauseIndex = circular.clauses.findIndex(c => c.clause_number === clausePath[0]);
        if (clauseIndex !== -1) {
          circular.clauses[clauseIndex] = updatedClause;
          return this.saveAllCircularsData(data);
        }
      } else {
        // Update nested clause
        const parentClause = this.findClauseByPath(circular.clauses, clausePath.slice(0, -1));
        if (parentClause && parentClause.clauses) {
          const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
          if (clauseIndex !== -1) {
            parentClause.clauses[clauseIndex] = updatedClause;
            return this.saveAllCircularsData(data);
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating clause in normal circular:', error);
      return false;
    }
  }

  deleteClauseFromNormalCircular(
    circularName: string,
    clausePath: string[]
  ): boolean {
    try {
      const data = this.getAllCircularsData();
      const circular = data.normal_circulars[circularName];
      
      if (!circular) {
        return false;
      }
      
      if (clausePath.length === 1) {
        // Delete root level clause
        const clauseIndex = circular.clauses.findIndex(c => c.clause_number === clausePath[0]);
        if (clauseIndex !== -1) {
          circular.clauses.splice(clauseIndex, 1);
          return this.saveAllCircularsData(data);
        }
      } else {
        // Delete nested clause
        const parentClause = this.findClauseByPath(circular.clauses, clausePath.slice(0, -1));
        if (parentClause && parentClause.clauses) {
          const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
          if (clauseIndex !== -1) {
            parentClause.clauses.splice(clauseIndex, 1);
            return this.saveAllCircularsData(data);
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting clause from normal circular:', error);
      return false;
    }
  }

  // Normal circular annexure methods
  addAnnexureToNormalCircular(circularName: string, annexure: Annexure): boolean {
    try {
      const data = this.getAllCircularsData();
      const circular = data.normal_circulars[circularName];
      
      if (!circular) {
        throw new Error(`Normal circular "${circularName}" not found`);
      }
      
      circular.annexures.push(annexure);
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error adding annexure to normal circular:', error);
      return false;
    }
  }

  deleteAnnexureFromNormalCircular(circularName: string, annexureIndex: number): boolean {
    try {
      const data = this.getAllCircularsData();
      const circular = data.normal_circulars[circularName];
      
      if (!circular) {
        return false;
      }
      
      if (annexureIndex >= 0 && annexureIndex < circular.annexures.length) {
        circular.annexures.splice(annexureIndex, 1);
        return this.saveAllCircularsData(data);
      }
      return false;
    } catch (error) {
      console.error('Error deleting annexure from normal circular:', error);
      return false;
    }
  }

  // Existing master circular methods (updated to use new structure)
  addChapter(circularType: CircularType, chapter: Chapter): boolean {
    try {
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      // Check for duplicate chapter numbers
      const exists = data.master_circulars[circularKey].content.some(
        c => c.chapter_number === chapter.chapter_number
      );
      
      if (exists) {
        throw new Error(`Chapter ${chapter.chapter_number} already exists`);
      }
      
      data.master_circulars[circularKey].content.push(chapter);
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error adding chapter:', error);
      return false;
    }
  }

  updateChapter(circularType: CircularType, chapterIndex: number, chapter: Chapter): boolean {
    try {
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data.master_circulars[circularKey].content.length) {
        data.master_circulars[circularKey].content[chapterIndex] = chapter;
        return this.saveAllCircularsData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating chapter:', error);
      return false;
    }
  }

  deleteChapter(circularType: CircularType, chapterIndex: number): boolean {
    try {
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data.master_circulars[circularKey].content.length) {
        data.master_circulars[circularKey].content.splice(chapterIndex, 1);
        return this.saveAllCircularsData(data);
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
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data.master_circulars[circularKey].content.length) {
        const chapter = data.master_circulars[circularKey].content[chapterIndex];
        
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
        
        return this.saveAllCircularsData(data);
      }
      return false;
    } catch (error) {
      console.error('Error adding clause:', error);
      return false;
    }
  }

  addAnnexure(circularType: CircularType, annexure: Annexure): boolean {
    try {
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      data.master_circulars[circularKey].annexures.push(annexure);
      return this.saveAllCircularsData(data);
    } catch (error) {
      console.error('Error adding annexure:', error);
      return false;
    }
  }

  deleteAnnexure(circularType: CircularType, annexureIndex: number): boolean {
    try {
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (annexureIndex >= 0 && annexureIndex < data.master_circulars[circularKey].annexures.length) {
        data.master_circulars[circularKey].annexures.splice(annexureIndex, 1);
        return this.saveAllCircularsData(data);
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
    const data = this.getAllCircularsData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Support both old and new data formats
      if (data.master_circular_2023 && !data.master_circulars) {
        // Old format - migrate
        const migratedData: AllCircularsData = {
          master_circulars: {
            master_circular_2023: data.master_circular_2023,
            master_circular_2024: data.master_circular_2024
          },
          normal_circulars: {}
        };
        return this.saveAllCircularsData(migratedData);
      } else if (data.master_circulars) {
        // New format
        return this.saveAllCircularsData(data as AllCircularsData);
      } else {
        throw new Error('Invalid data structure');
      }
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
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data.master_circulars[circularKey].content.length) {
        const chapter = data.master_circulars[circularKey].content[chapterIndex];
        
        if (clausePath.length === 1) {
          // Delete root level clause
          const clauseIndex = chapter.clauses.findIndex(c => c.clause_number === clausePath[0]);
          if (clauseIndex !== -1) {
            chapter.clauses.splice(clauseIndex, 1);
            return this.saveAllCircularsData(data);
          }
        } else {
          // Delete nested clause
          const parentClause = this.findClauseByPath(chapter.clauses, clausePath.slice(0, -1));
          if (parentClause && parentClause.clauses) {
            const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
            if (clauseIndex !== -1) {
              parentClause.clauses.splice(clauseIndex, 1);
              return this.saveAllCircularsData(data);
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
      const data = this.getAllCircularsData();
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      
      if (chapterIndex >= 0 && chapterIndex < data.master_circulars[circularKey].content.length) {
        const chapter = data.master_circulars[circularKey].content[chapterIndex];
        
        if (clausePath.length === 1) {
          // Update root level clause
          const clauseIndex = chapter.clauses.findIndex(c => c.clause_number === clausePath[0]);
          if (clauseIndex !== -1) {
            chapter.clauses[clauseIndex] = updatedClause;
            return this.saveAllCircularsData(data);
          }
        } else {
          // Update nested clause
          const parentClause = this.findClauseByPath(chapter.clauses, clausePath.slice(0, -1));
          if (parentClause && parentClause.clauses) {
            const clauseIndex = parentClause.clauses.findIndex(c => c.clause_number === clausePath[clausePath.length - 1]);
            if (clauseIndex !== -1) {
              parentClause.clauses[clauseIndex] = updatedClause;
              return this.saveAllCircularsData(data);
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

  getDataStats(circularType: CircularType | string, mode: CircularMode = 'master') {
    const data = this.getAllCircularsData();
    
    if (mode === 'master') {
      const circularKey = `master_circular_${circularType}` as keyof MasterCircularData;
      const circular = data.master_circulars[circularKey];
      
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
    } else {
      // Normal circular
      const circular = data.normal_circulars[circularType as string];
      
      if (!circular) {
        return {
          chaptersCount: 0,
          clausesCount: 0,
          annexuresCount: 0
        };
      }
      
      const countClauses = (clauses: Clause[]): number => {
        return clauses.reduce((count, clause) => {
          return count + 1 + (clause.clauses ? countClauses(clause.clauses) : 0);
        }, 0);
      };
      
      return {
        chaptersCount: 0,
        clausesCount: countClauses(circular.clauses),
        annexuresCount: circular.annexures.length
      };
    }
  }
}

export const localStorageService = new LocalStorageService(); 