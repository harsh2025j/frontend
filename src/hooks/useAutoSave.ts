import { useEffect, useRef, useState, useCallback } from 'react';

export type AutoSaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 3000,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const lastSavedData = useRef<string>('');
  const isFirstRender = useRef(true);
  const retryCount = useRef(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a ref of the latest onSave callback to avoid dependency cycle
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const attemptSave = useCallback(async (currentDataString: string, dataToSave: T) => {
    setStatus('saving');
    try {
      await onSaveRef.current(dataToSave);
      lastSavedData.current = currentDataString;
      retryCount.current = 0; // Reset retry counter on success
      setStatus('saved');
    } catch (error) {
      if (retryCount.current === 0) {
        retryCount.current = 1;
        setStatus('error');
        // Automatically retry once after 2 seconds
        setTimeout(() => {
          attemptSave(currentDataString, dataToSave);
        }, 2000);
      } else {
        // Failed again, leave in error state until data changes
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      lastSavedData.current = JSON.stringify(data);
      isFirstRender.current = false;
      return;
    }

    const currentDataString = JSON.stringify(data);

    if (currentDataString === lastSavedData.current) {
      if (status === 'unsaved') setStatus('idle');
      return;
    }

    if (!enabled) {
      setStatus('idle');
      return;
    }

    // Only set to unsaved if we aren't already saving or error 
    setStatus((prev) => (prev === 'saving' || prev === 'error') ? prev : 'unsaved');
    retryCount.current = 0; // New changes mean we reset retry limits

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      attemptSave(currentDataString, data);
    }, delay);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, delay, attemptSave, enabled]);

  const resetBaseline = useCallback((newData: T) => {
    lastSavedData.current = JSON.stringify(newData);
  }, []);

  return { status, resetBaseline };
}

