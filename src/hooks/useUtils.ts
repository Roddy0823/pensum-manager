import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
    isOnline: boolean;
    wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Track that we just came back online
            if (!isOnline) {
                setWasOffline(true);
                // Reset after a short delay
                setTimeout(() => setWasOffline(false), 5000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    return { isOnline, wasOffline };
}

interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseAsyncOptions {
    immediate?: boolean;
    retryCount?: number;
    retryDelay?: number;
}

export function useAsync<T, Args extends unknown[]>(
    asyncFunction: (...args: Args) => Promise<T>,
    options: UseAsyncOptions = {}
) {
    const { immediate = false, retryCount = 0, retryDelay = 1000 } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(
        async (...args: Args): Promise<T | null> => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            let lastError: Error | null = null;

            for (let attempt = 0; attempt <= retryCount; attempt++) {
                try {
                    const result = await asyncFunction(...args);
                    setState({ data: result, loading: false, error: null });
                    return result;
                } catch (error) {
                    lastError = error as Error;

                    if (attempt < retryCount) {
                        // Wait before retrying with exponential backoff
                        await new Promise(resolve =>
                            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
                        );
                    }
                }
            }

            const errorMessage = lastError?.message || 'Error desconocido';
            setState({ data: null, loading: false, error: errorMessage });
            return null;
        },
        [asyncFunction, retryCount, retryDelay]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Hook for local storage with type safety
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        },
        [key, storedValue]
    );

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

// Hook for document title
export function useDocumentTitle(title: string): void {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = `${title} | Pensum Manager`;

        return () => {
            document.title = previousTitle;
        };
    }, [title]);
}

// Hook for keyboard shortcuts
export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
): void {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { ctrl = false, shift = false, alt = false } = modifiers;

            if (
                event.key.toLowerCase() === key.toLowerCase() &&
                event.ctrlKey === ctrl &&
                event.shiftKey === shift &&
                event.altKey === alt
            ) {
                event.preventDefault();
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, modifiers]);
}

// Hook for click outside detection
export function useClickOutside<T extends HTMLElement>(
    callback: () => void
): React.RefObject<T> {
    const ref = React.useRef<T>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback]);

    return ref;
}

import React from 'react';
