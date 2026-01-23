import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  key: string; // localStorage key
  data: any; // Form data to save
  enabled?: boolean; // Whether auto-save is enabled (default: true)
  debounceMs?: number; // Debounce delay in milliseconds (default: 1000)
  onRestore?: (data: any) => void; // Callback when data is restored
}

export function useAutoSave({
  key,
  data,
  enabled = true,
  debounceMs = 1000,
  onRestore,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Save to localStorage
  const saveDraft = useCallback(
    (dataToSave: any) => {
      try {
        // Don't save File objects (they can't be serialized)
        const serializableData = JSON.parse(
          JSON.stringify(dataToSave, (key, value) => {
            // Skip File objects and functions
            if (value instanceof File) {
              return null;
            }
            if (typeof value === 'function') {
              return undefined;
            }
            return value;
          })
        );

        localStorage.setItem(key, JSON.stringify(serializableData));
        setIsSaving(false);
        setLastSaved(new Date());
        setHasDraft(true);
      } catch (error) {
        console.error('Error saving draft:', error);
        setIsSaving(false);
      }
    },
    [key]
  );

  // Restore from localStorage
  const restoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasDraft(true);
        if (onRestore) {
          onRestore(parsed);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
    }
    return null;
  }, [key, onRestore]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [key]);

  // Auto-save effect (debounced)
  useEffect(() => {
    if (!enabled) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsSaving(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDraft(data);
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, saveDraft]);

  // Check for existing draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setHasDraft(true);
    }
  }, [key]);

  return {
    isSaving,
    lastSaved,
    hasDraft,
    restoreDraft,
    clearDraft,
  };
}
