/**
 * Neomodels Database Manager
 * Handles fetching, caching, and querying models from neomodels.vercel.app
 * Uses intelligent caching (24-hour TTL) to minimize API calls
 */

import type {
  NeoModel,
  NeoModelProvider,
  NeomodeelsDatabase,
  NeomodelsCacheConfig,
  NeomodelsSearchOptions,
  NeomodelsSearchResult,
} from './types';

// Default cache configuration (24 hours)
const DEFAULT_CACHE_CONFIG: NeomodelsCacheConfig = {
  ttl: 24 * 60 * 60 * 1000,
  storageKey: 'neomodels_cache_v1',
  maxSize: 1000,
};

class NeomodelsDatabase {
  private _database: NeomodeelsDatabase | null = null;
  private _cacheConfig: NeomodelsCacheConfig;
  private _isInitialized = false;
  private _initPromise: Promise<void> | null = null;

  constructor(cacheConfig?: Partial<NeomodelsCacheConfig>) {
    this._cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
  }

  /**
   * Initialize the database, either from cache or by fetching fresh data
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    if (this._initPromise) {
      await this._initPromise;

      return;
    }

    this._initPromise = this._performInitialization();
    await this._initPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      // Try to load from cache first
      const cached = this._loadFromCache();

      if (cached && !this._isCacheExpired(cached)) {
        this._database = cached;
        this._isInitialized = true;

        return;
      }

      // Fetch fresh data from neomodels API
      this._database = await this._fetchFromNeomodels();
      this._saveToCache(this._database);
      this._isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize neomodels database:', error);

      // Fallback to empty database
      this._database = this._createEmptyDatabase();
      this._isInitialized = true;
    }
  }

  /**
   * Fetch all models from neomodels.vercel.app
   */
  private async _fetchFromNeomodels(): Promise<NeomodeelsDatabase> {
    const database: NeomodeelsDatabase = {
      providers: new Map(),
      allModels: new Map(),
      categories: new Map(),
      lastUpdated: Date.now(),
      version: '1.0.0',
    };

    try {
      // Fetch the main neomodels index page
      const response = await fetch('https://neomodels.vercel.app/api/models', {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'octotask.diy/neomodels-integration',
        },
      });

      if (!response.ok) {
        console.warn(`Neomodels API returned ${response.status}, using fallback data`);
        return this._createEmptyDatabase();
      }

      const data = await response.json();

      return this._parseNeomodelsData(data, database);
    } catch (error) {
      console.error('Error fetching from neomodels API:', error);
      return this._createEmptyDatabase();
    }
  }

  /**
   * Parse neomodels API response and populate database
   */
  private _parseNeomodelsData(data: any, database: NeomodeelsDatabase): NeomodeelsDatabase {
    // Expected format: { providers: [...], models: [...] }
    const providers = data.providers || [];
    const models = data.models || [];

    // Process providers
    for (const providerData of providers) {
      const provider: NeoModelProvider = {
        id: providerData.id || providerData.name.toLowerCase().replace(/\s+/g, '-'),
        name: providerData.name,
        category: providerData.category || 'direct',
        website: providerData.website,
        enabled: providerData.enabled !== false,
        configurable: providerData.configurable || false,
        requiredEnvVars: providerData.requiredEnvVars,
        documentation: providerData.documentation,
        models: [],
      };
      database.providers.set(provider.id, provider);
    }

    // Process models
    for (const modelData of models) {
      const model: NeoModel = {
        id: modelData.id || modelData.name,
        name: modelData.name,
        provider: modelData.provider,
        description: modelData.description,
        capabilities: modelData.capabilities,
        costPer1kInputTokens: modelData.costPer1kInputTokens,
        costPer1kOutputTokens: modelData.costPer1kOutputTokens,
        maxTokens: modelData.maxTokens,
        releaseDate: modelData.releaseDate,
        category: modelData.category,
        isActive: modelData.isActive !== false,
        modelType: modelData.modelType,
        deprecated: modelData.deprecated || false,
        tags: modelData.tags,
        contextWindow: modelData.contextWindow,
        trainingDataCutoff: modelData.trainingDataCutoff,
      };

      database.allModels.set(model.id, model);

      // Associate with provider
      const provider = database.providers.get(modelData.provider);

      if (provider) {
        provider.models.push(model);
      }

      // Index by category
      if (model.category) {
        if (!database.categories.has(model.category)) {
          database.categories.set(model.category, []);
        }

        database.categories.get(model.category)!.push(model);
      }
    }

    return database;
  }

  /**
   * Create empty database structure
   */
  private _createEmptyDatabase(): NeomodeelsDatabase {
    return {
      providers: new Map(),
      allModels: new Map(),
      categories: new Map(),
      lastUpdated: Date.now(),
      version: '1.0.0',
    };
  }

  /**
   * Search models with advanced filtering and sorting
   */
  async search(options: NeomodelsSearchOptions): Promise<NeomodelsSearchResult> {
    await this.initialize();

    if (!this._database) {
      return { models: [], total: 0, hasMore: false, query: options };
    }

    let models = Array.from(this._database.allModels.values());

    // Filter by provider
    if (options.provider) {
      models = models.filter((m) => m.provider === options.provider);
    }

    // Filter by category
    if (options.category) {
      models = models.filter((m) => m.category === options.category);
    }

    // Filter by query (search in name and description)
    if (options.query) {
      const query = options.query.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.provider.toLowerCase().includes(query),
      );
    }

    // Filter out deprecated models
    models = models.filter((m) => !m.deprecated && m.isActive !== false);

    // Sort
    const sortBy = options.sortBy || 'name';
    models.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'cost':
          aVal = (a.costPer1kInputTokens || 0) + (a.costPer1kOutputTokens || 0);
          bVal = (b.costPer1kInputTokens || 0) + (b.costPer1kOutputTokens || 0);
          break;
        case 'releaseDate':
          aVal = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          bVal = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          break;
        case 'contextWindow':
          aVal = a.contextWindow || 0;
          bVal = b.contextWindow || 0;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (aVal < bVal) {
        return options.sortOrder === 'desc' ? 1 : -1;
      }

      if (aVal > bVal) {
        return options.sortOrder === 'desc' ? -1 : 1;
      }

      return 0;
    });

    // Pagination
    const offset = options.offset || 0;
    const limit = Math.min(options.limit || 50, 100); // Max 100 per request
    const paginatedModels = models.slice(offset, offset + limit);

    return {
      models: paginatedModels,
      total: models.length,
      hasMore: offset + limit < models.length,
      query: options,
    };
  }

  /**
   * Get all providers
   */
  async getProviders(): Promise<NeoModelProvider[]> {
    await this.initialize();
    return Array.from(this._database?.providers.values() || []);
  }

  /**
   * Get provider by ID
   */
  async getProvider(providerId: string): Promise<NeoModelProvider | null> {
    await this.initialize();
    return this._database?.providers.get(providerId) || null;
  }

  /**
   * Get model by ID
   */
  async getModel(modelId: string): Promise<NeoModel | null> {
    await this.initialize();
    return this._database?.allModels.get(modelId) || null;
  }

  /**
   * Get models by category
   */
  async getModelsByCategory(category: NeoModel['category']): Promise<NeoModel[]> {
    await this.initialize();

    if (!category) {
      return [];
    }

    return this._database?.categories.get(category) || [];
  }

  /**
   * Force refresh the database from neomodels
   */
  async refresh(): Promise<void> {
    this._database = null;
    this._isInitialized = false;
    this._initPromise = null;
    await this.initialize();
  }

  /**
   * Load from cache
   */
  private _loadFromCache(): NeomodeelsDatabase | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const cached = localStorage.getItem(this._cacheConfig.storageKey);

      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);

      // Recreate Maps from parsed data
      return {
        providers: new Map(parsed.providers),
        allModels: new Map(parsed.allModels),
        categories: new Map(parsed.categories),
        lastUpdated: parsed.lastUpdated,
        version: parsed.version,
      };
    } catch (error) {
      console.error('Error loading neomodels cache:', error);
      return null;
    }
  }

  /**
   * Save to cache
   */
  private _saveToCache(database: NeomodeelsDatabase): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const data = {
        providers: Array.from(database.providers.entries()),
        allModels: Array.from(database.allModels.entries()),
        categories: Array.from(database.categories.entries()),
        lastUpdated: database.lastUpdated,
        version: database.version,
      };

      localStorage.setItem(this._cacheConfig.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving neomodels cache:', error);
    }
  }

  /**
   * Check if cache is expired
   */
  private _isCacheExpired(database: NeomodeelsDatabase): boolean {
    const age = Date.now() - database.lastUpdated;
    return age > this._cacheConfig.ttl;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      isInitialized: this._isInitialized,
      modelsCount: this._database?.allModels.size || 0,
      providersCount: this._database?.providers.size || 0,
      lastUpdated: this._database?.lastUpdated || null,
      cacheExpiry: this._database ? this._database.lastUpdated + this._cacheConfig.ttl : null,
    };
  }
}

// Singleton instance
let instance: NeomodelsDatabase | null = null;

export function getNeomodelsDatabase(): NeomodelsDatabase {
  if (!instance) {
    instance = new NeomodelsDatabase();
  }

  return instance;
}

export { NeomodelsDatabase };
