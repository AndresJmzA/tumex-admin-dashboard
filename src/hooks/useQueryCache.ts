import { useState, useEffect, useCallback, useRef } from 'react';

// Tipos para el sistema de caché
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  loading?: boolean;
  error?: string;
}

interface QueryOptions {
  ttl?: number; // Tiempo de vida en milisegundos
  staleTime?: number; // Tiempo antes de considerar datos obsoletos
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

// Sistema de caché global
class GlobalCache {
  private static instance: GlobalCache;
  private cache = new Map<string, CacheEntry<any>>();
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  static getInstance(): GlobalCache {
    if (!GlobalCache.instance) {
      GlobalCache.instance = new GlobalCache();
    }
    return GlobalCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.notifySubscribers(key, data);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  setLoading(key: string, loading: boolean): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.loading = loading;
      this.notifySubscribers(key, entry.data);
    }
  }

  setError(key: string, error: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.error = error;
      this.notifySubscribers(key, entry.data);
    }
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.notifySubscribers(key, null);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.forEach(subscribers => {
      subscribers.forEach(callback => callback(null));
    });
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string, data: any): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }
}

// Hook personalizado para consultas optimizadas
export function useQueryCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  const cache = GlobalCache.getInstance();
  const [data, setData] = useState<T | null>(cache.get<T>(key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    ttl = 5 * 60 * 1000,
    staleTime = 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus = true,
    refetchOnMount = true
  } = options;

  const executeQuery = useCallback(async (force = false) => {
    // Verificar si los datos están en caché y no están obsoletos
    const cached = cache.get<T>(key);
    const isStale = cached && (Date.now() - (cache as any).cache.get(key)?.timestamp > staleTime);

    if (cached && !isStale && !force) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancelar consulta anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      // Verificar si la consulta fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      cache.set(key, result, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        cache.setError(key, errorMessage);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [key, queryFn, ttl, staleTime, cache]);

  const refetch = useCallback(async () => {
    await executeQuery(true);
  }, [executeQuery]);

  const invalidate = useCallback(() => {
    cache.invalidate(key);
    setData(null);
    setError(null);
  }, [key, cache]);

  // Suscribirse a cambios en el caché
  useEffect(() => {
    const unsubscribe = cache.subscribe(key, (newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, [key, cache]);

  // Ejecutar consulta inicial
  useEffect(() => {
    if (refetchOnMount) {
      executeQuery();
    }
  }, [executeQuery, refetchOnMount]);

  // Refetch al enfocar la ventana
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      executeQuery();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [executeQuery, refetchOnWindowFocus]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

// Hook para mutaciones (crear, actualizar, eliminar)
export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: {
    onSuccess?: (data: R) => void;
    onError?: (error: string) => void;
    invalidateQueries?: string[];
  } = {}
): {
  mutate: (data: T) => Promise<R | null>;
  loading: boolean;
  error: string | null;
} {
  const cache = GlobalCache.getInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: T): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(data);
      
      // Invalidar caché relacionado
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(pattern => {
          cache.invalidate(pattern);
        });
      }

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options, cache]);

  return {
    mutate,
    loading,
    error
  };
}

// Hook para consultas optimizadas con React Query
export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  return useQueryCache(key, queryFn, options);
}

// Utilidades para el caché
export const cacheUtils = {
  invalidate: (pattern: string) => {
    GlobalCache.getInstance().invalidate(pattern);
  },
  clear: () => {
    GlobalCache.getInstance().clear();
  },
  get: <T>(key: string): T | null => {
    return GlobalCache.getInstance().get<T>(key);
  },
  set: <T>(key: string, data: T, ttl?: number) => {
    GlobalCache.getInstance().set(key, data, ttl);
  }
};

export default useQueryCache; 