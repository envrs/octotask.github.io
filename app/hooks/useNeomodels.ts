/**
 * useNeomodels Hook
 * Client-side hook for accessing neomodels data with caching and search
 */

import { useCallback, useState, useEffect } from 'react';
import type { NeoModel, NeomodelsSearchOptions, NeomodelsSearchResult } from '~/lib/neomodels';

interface UseNeomodelsOptions {
  autoLoad?: boolean;
  cacheTime?: number; // milliseconds
}

interface UseNeomodelsReturn {
  models: NeoModel[];
  providers: any[];
  categories: Record<string, NeoModel[]>;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  search: (options: NeomodelsSearchOptions) => Promise<NeomodelsSearchResult>;
  getProviders: () => Promise<any[]>;
  getModel: (id: string) => Promise<NeoModel | null>;
  getCategories: () => Promise<Record<string, NeoModel[]>>;
  refresh: () => Promise<void>;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

let searchCache = new Map<string, { data: NeomodelsSearchResult; timestamp: number }>();
let providersCache: { data: any[]; timestamp: number } | null = null;

function getCacheKey(options: NeomodelsSearchOptions): string {
  return JSON.stringify({
    q: options.query,
    provider: options.provider,
    category: options.category,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    limit: options.limit,
    offset: options.offset,
  });
}

export function useNeomodels(options: UseNeomodelsOptions = {}): UseNeomodelsReturn {
  const { autoLoad = false, cacheTime = CACHE_TIME } = options;

  const [models, setModels] = useState<NeoModel[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, NeoModel[]>>({});
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Search models with caching
   */
  const search = useCallback(async (options: NeomodelsSearchOptions): Promise<NeomodelsSearchResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const cacheKey = getCacheKey(options);
      const cached = searchCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setModels(cached.data.models);
        setTotal(cached.data.total);
        setHasMore(cached.data.hasMore);
        setIsLoading(false);
        return cached.data;
      }

      const params = new URLSearchParams();
      params.set('action', 'search');
      if (options.query) params.set('q', options.query);
      if (options.provider) params.set('provider', options.provider);
      if (options.category) params.set('category', options.category);
      params.set('sortBy', options.sortBy || 'name');
      params.set('sortOrder', options.sortOrder || 'asc');
      params.set('limit', String(options.limit || 50));
      params.set('offset', String(options.offset || 0));

      const response = await fetch(`/api/neomodels?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Unknown error');
      }

      const result = json.data as NeomodelsSearchResult;

      // Cache the result
      searchCache.set(cacheKey, { data: result, timestamp: Date.now() });

      // Keep max 50 cache entries to avoid memory leak
      if (searchCache.size > 50) {
        const oldestKey = Array.from(searchCache.entries()).sort(
          (a, b) => a[1].timestamp - b[1].timestamp
        )[0][0];
        searchCache.delete(oldestKey);
      }

      setModels(result.models);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setIsLoading(false);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, [cacheTime]);

  /**
   * Get all providers
   */
  const getProviders = useCallback(async () => {
    try {
      if (providersCache && Date.now() - providersCache.timestamp < cacheTime) {
        setProviders(providersCache.data);
        return providersCache.data;
      }

      const response = await fetch('/api/neomodels?action=providers');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Unknown error');
      }

      const providersData = json.data.providers;
      providersCache = { data: providersData, timestamp: Date.now() };
      setProviders(providersData);

      return providersData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [cacheTime]);

  /**
   * Get single model
   */
  const getModel = useCallback(async (id: string): Promise<NeoModel | null> => {
    try {
      const response = await fetch(`/api/neomodels?action=model&id=${encodeURIComponent(id)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        return null;
      }

      return json.data.model;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    }
  }, []);

  /**
   * Get models by category
   */
  const getCategories = useCallback(async (): Promise<Record<string, NeoModel[]>> => {
    try {
      const response = await fetch('/api/neomodels?action=categories');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Unknown error');
      }

      const categoriesData = json.data;
      setCategories(categoriesData);

      return categoriesData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Refresh cache
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/neomodels?action=refresh');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Clear local caches
      searchCache.clear();
      providersCache = null;

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  /**
   * Auto-load on mount
   */
  useEffect(() => {
    if (autoLoad) {
      search({ limit: 50 }).catch(console.error);
      getProviders().catch(console.error);
    }
  }, [autoLoad, search, getProviders]);

  return {
    models,
    providers,
    categories,
    total,
    hasMore,
    isLoading,
    error,
    search,
    getProviders,
    getModel,
    getCategories,
    refresh,
  };
}
