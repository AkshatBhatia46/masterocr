import { useState, useEffect, useCallback } from 'react';
import { MasterCircularData, CircularType, Chapter, Clause, Annexure } from '../types/masterCircular';
import { localStorageService } from '../services/LocalStorageService';

export function useMasterCircularData() {
  const [data, setData] = useState<MasterCircularData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const loadedData = localStorageService.getMasterCircularData();
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
  const saveData = useCallback((newData: MasterCircularData) => {
    try {
      const success = localStorageService.saveMasterCircularData(newData);
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

  const addChapter = useCallback((circularType: CircularType, chapter: Chapter) => {
    try {
      const success = localStorageService.addChapter(circularType, chapter);
      if (success) {
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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

  const getStats = useCallback((circularType: CircularType) => {
    return localStorageService.getDataStats(circularType);
  }, []);

  const exportData = useCallback(() => {
    return localStorageService.exportData();
  }, []);

  const importData = useCallback((jsonString: string) => {
    try {
      const success = localStorageService.importData(jsonString);
      if (success) {
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const updatedData = localStorageService.getMasterCircularData();
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
        const defaultData = localStorageService.getMasterCircularData();
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