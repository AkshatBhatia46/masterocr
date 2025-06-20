import { useState, useEffect, useCallback } from 'react';
import { 
  MasterCircularData, 
  CircularType, 
  Chapter, 
  Clause, 
  Annexure, 
  AllCircularsData,
  CircularMode
} from '../types/masterCircular';
import { localStorageService } from '../services/LocalStorageService';

export function useCircularData() {
  const [data, setData] = useState<AllCircularsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const loadedData = localStorageService.getAllCircularsData();
      setData(loadedData);
      setError(null);
    } catch (err) {
      setError('Failed to load data from localStorage');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data whenever it changes
  const saveData = useCallback((newData: AllCircularsData) => {
    try {
      const success = localStorageService.saveAllCircularsData(newData);
      if (success) {
        setData(newData);
        setError(null);
      } else {
        setError('Failed to save data');
      }
      return success;
    } catch (err) {
      setError('Failed to save data');
      console.error('Error saving data:', err);
      return false;
    }
  }, []);

  // Normal circular methods
  const getNormalCircularNames = useCallback(() => {
    if (!data) return [];
    return Object.keys(data.normal_circulars);
  }, [data]);

  const addNormalCircular = useCallback((circularName: string) => {
    try {
      const success = localStorageService.addNormalCircular(circularName);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add normal circular');
      console.error('Error adding normal circular:', err);
      return false;
    }
  }, []);

  const deleteNormalCircular = useCallback((circularName: string) => {
    try {
      const success = localStorageService.deleteNormalCircular(circularName);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete normal circular');
      console.error('Error deleting normal circular:', err);
      return false;
    }
  }, []);

  const addClauseToNormalCircular = useCallback((
    circularName: string,
    clause: Clause,
    parentClausePath?: string[]
  ) => {
    try {
      const success = localStorageService.addClauseToNormalCircular(circularName, clause, parentClausePath);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add clause to normal circular');
      console.error('Error adding clause to normal circular:', err);
      return false;
    }
  }, []);

  const updateClauseInNormalCircular = useCallback((
    circularName: string,
    clausePath: string[],
    clause: Clause
  ) => {
    try {
      const success = localStorageService.updateClauseInNormalCircular(circularName, clausePath, clause);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to update clause in normal circular');
      console.error('Error updating clause in normal circular:', err);
      return false;
    }
  }, []);

  const deleteClauseFromNormalCircular = useCallback((
    circularName: string,
    clausePath: string[]
  ) => {
    try {
      const success = localStorageService.deleteClauseFromNormalCircular(circularName, clausePath);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete clause from normal circular');
      console.error('Error deleting clause from normal circular:', err);
      return false;
    }
  }, []);

  const addAnnexureToNormalCircular = useCallback((circularName: string, annexure: Annexure) => {
    try {
      const success = localStorageService.addAnnexureToNormalCircular(circularName, annexure);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add annexure to normal circular');
      console.error('Error adding annexure to normal circular:', err);
      return false;
    }
  }, []);

  const deleteAnnexureFromNormalCircular = useCallback((circularName: string, annexureIndex: number) => {
    try {
      const success = localStorageService.deleteAnnexureFromNormalCircular(circularName, annexureIndex);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete annexure from normal circular');
      console.error('Error deleting annexure from normal circular:', err);
      return false;
    }
  }, []);

  // Master circular methods (existing, updated to work with new structure)
  const addChapter = useCallback((circularType: CircularType, chapter: Chapter) => {
    try {
      const success = localStorageService.addChapter(circularType, chapter);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add chapter');
      console.error('Error adding chapter:', err);
      return false;
    }
  }, []);

  const updateChapter = useCallback((circularType: CircularType, chapterIndex: number, chapter: Chapter) => {
    try {
      const success = localStorageService.updateChapter(circularType, chapterIndex, chapter);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to update chapter');
      console.error('Error updating chapter:', err);
      return false;
    }
  }, []);

  const deleteChapter = useCallback((circularType: CircularType, chapterIndex: number) => {
    try {
      const success = localStorageService.deleteChapter(circularType, chapterIndex);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete chapter');
      console.error('Error deleting chapter:', err);
      return false;
    }
  }, []);

  const addClause = useCallback((
    circularType: CircularType, 
    chapterIndex: number, 
    clause: Clause, 
    parentClausePath?: string[]
  ) => {
    try {
      const success = localStorageService.addClauseToChapter(circularType, chapterIndex, clause, parentClausePath);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add clause');
      console.error('Error adding clause:', err);
      return false;
    }
  }, []);

  const addAnnexure = useCallback((circularType: CircularType, annexure: Annexure) => {
    try {
      const success = localStorageService.addAnnexure(circularType, annexure);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to add annexure');
      console.error('Error adding annexure:', err);
      return false;
    }
  }, []);

  const deleteAnnexure = useCallback((circularType: CircularType, annexureIndex: number) => {
    try {
      const success = localStorageService.deleteAnnexure(circularType, annexureIndex);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete annexure');
      console.error('Error deleting annexure:', err);
      return false;
    }
  }, []);

  const getStats = useCallback((circularType: CircularType | string, mode: CircularMode = 'master') => {
    return localStorageService.getDataStats(circularType, mode);
  }, []);

  const exportData = useCallback(() => {
    return localStorageService.exportData();
  }, []);

  const importData = useCallback((jsonString: string) => {
    try {
      const success = localStorageService.importData(jsonString);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to import data');
      console.error('Error importing data:', err);
      return false;
    }
  }, []);

  const updateClause = useCallback((
    circularType: CircularType, 
    chapterIndex: number, 
    clausePath: string[],
    clause: Clause
  ) => {
    try {
      const success = localStorageService.updateClause(circularType, chapterIndex, clausePath, clause);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to update clause');
      console.error('Error updating clause:', err);
      return false;
    }
  }, []);

  const deleteClause = useCallback((
    circularType: CircularType, 
    chapterIndex: number, 
    clausePath: string[]
  ) => {
    try {
      const success = localStorageService.deleteClause(circularType, chapterIndex, clausePath);
      if (success) {
        const updatedData = localStorageService.getAllCircularsData();
        setData(updatedData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to delete clause');
      console.error('Error deleting clause:', err);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    try {
      const success = localStorageService.clearAllData();
      if (success) {
        const defaultData = localStorageService.getAllCircularsData();
        setData(defaultData);
        setError(null);
      }
      return success;
    } catch (err) {
      setError('Failed to clear data');
      console.error('Error clearing data:', err);
      return false;
    }
  }, []);

  return {
    data,
    loading,
    error,
    saveData,
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
    deleteAnnexure,
    getStats,
    exportData,
    importData,
    clearAllData
  };
}

// Legacy hook for backward compatibility
export function useMasterCircularData() {
  const circularData = useCircularData();
  
  // Transform the data to maintain backward compatibility
  const legacyData = circularData.data ? circularData.data.master_circulars : null;
  
  return {
    ...circularData,
    data: legacyData
  };
} 