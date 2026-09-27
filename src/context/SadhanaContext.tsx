import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {SADHANA_DATA_VERSION, SADHANA_STORAGE_KEY} from '../constants/storage';
import {createEntry, SadhanaEntry, SadhanaExport} from '../utils/sadhana';

type SadhanaContextValue = {
  entries: SadhanaEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (values: Omit<SadhanaEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  exportData: () => SadhanaExport;
};

const SadhanaContext = createContext<SadhanaContextValue | undefined>(undefined);

export function SadhanaProvider({children}: {children: React.ReactNode}) {
  const [entries, setEntries] = useState<SadhanaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntries() {
      try {
        const stored = await AsyncStorage.getItem(SADHANA_STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setEntries(parsed as SadhanaEntry[]);
          }
        }
      } catch {
        setError('Saved sadhana could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEntries();
  }, []);

  const addEntry = useCallback(async (values: Omit<SadhanaEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextEntries = [createEntry(values), ...entries];
    try {
      await AsyncStorage.setItem(SADHANA_STORAGE_KEY, JSON.stringify(nextEntries));
      setEntries(nextEntries);
      setError(null);
    } catch {
      setError('Your sadhana could not be saved. Please try again.');
      throw new Error('Unable to save sadhana entry');
    }
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      isLoading,
      error,
      addEntry,
      exportData: () => ({
        version: SADHANA_DATA_VERSION,
        exportedAt: new Date().toISOString(),
        entries,
      }),
    }),
    [addEntry, entries, error, isLoading],
  );

  return <SadhanaContext.Provider value={value}>{children}</SadhanaContext.Provider>;
}

export function useSadhana() {
  const context = useContext(SadhanaContext);
  if (!context) {
    throw new Error('useSadhana must be used inside SadhanaProvider');
  }
  return context;
}
