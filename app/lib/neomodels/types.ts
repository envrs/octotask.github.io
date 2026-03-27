/**
 * Neomodels type definitions
 * Core types for the neomodels integration system
 */

export interface NeoModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  capabilities?: string[];
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  maxTokens?: number;
  releaseDate?: string;
  category?: 'text' | 'vision' | 'audio' | 'multimodal' | 'embedding';
  isActive?: boolean;
  modelType?: 'large' | 'medium' | 'small' | 'tiny';
  deprecated?: boolean;
  tags?: string[];
  contextWindow?: number;
  trainingDataCutoff?: string;
}

export interface NeoModelProvider {
  id: string;
  name: string;
  category: 'aggregator' | 'direct' | 'api-gateway';
  website?: string;
  models: NeoModel[];
  enabled: boolean;
  configurable: boolean;
  requiredEnvVars?: string[];
  documentation?: string;
}

export interface NeomodeelsDatabase {
  providers: Map<string, NeoModelProvider>;
  allModels: Map<string, NeoModel>;
  categories: Map<string, NeoModel[]>;
  lastUpdated: number;
  version: string;
}

export interface NeomodelsCacheConfig {
  ttl: number; // Time to live in milliseconds (24 hours default)
  storageKey: string;
  maxSize?: number;
}

export interface NeomodelsSearchOptions {
  query?: string;
  provider?: string;
  category?: NeoModel['category'];
  sortBy?: 'name' | 'cost' | 'releaseDate' | 'contextWindow';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface NeomodelsSearchResult {
  models: NeoModel[];
  total: number;
  hasMore: boolean;
  query?: NeomodelsSearchOptions;
}
