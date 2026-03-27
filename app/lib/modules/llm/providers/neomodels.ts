/**
 * Universal Neomodels Provider
 * Routes requests to the appropriate backend provider based on model ID
 * Supports all 1000+ models from neomodels.vercel.app
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { getNeomodelsDatabase } from '~/lib/neomodels';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';

export default class NeomodelsProvider extends BaseProvider {
  name = 'Neomodels';
  getApiKeyLink = 'https://neomodels.vercel.app';
  labelForGetApiKey = 'View Neomodels Directory';

  config = {
    apiTokenKey: 'NEOMODELS_API_KEY',
  };

  staticModels: ModelInfo[] = [
    // Placeholder - will be populated dynamically from neomodels database
    {
      name: 'neomodels-loader',
      label: 'Loading Neomodels...',
      provider: 'Neomodels',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
  ];

  private _dynamicModelsCache?: {
    cacheId: string;
    models: ModelInfo[];
  };

  /**
   * Get dynamic models from neomodels database
   */
  async getDynamicModels(
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    try {
      const db = getNeomodelsDatabase();
      await db.initialize();

      // Get all active models from neomodels
      const searchResult = await db.search({
        limit: 1000,
      });

      const models: ModelInfo[] = searchResult.models
        .filter((model) => model.isActive && !model.deprecated)
        .map((model) => ({
          name: model.id,
          label: `${model.name} (${model.provider})`,
          provider: 'Neomodels',
          maxTokenAllowed: model.contextWindow || 128000,
          maxCompletionTokens: model.maxTokens || 4096,
          category: model.category,
          costPer1kInputTokens: model.costPer1kInputTokens,
          costPer1kOutputTokens: model.costPer1kOutputTokens,
          releaseDate: model.releaseDate,
          modelType: model.modelType,
          tags: model.tags,
          description: model.description,
        }));

      return models;
    } catch (error) {
      console.error('Error loading neomodels:', error);
      return this.staticModels;
    }
  }

  /**
   * Get model instance for neomodels
   * Routes to appropriate provider based on model ID
   */
  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, apiKeys, providerSettings } = options;

    // For neomodels, we route based on model prefix or use a default
    const parts = model.split('/');
    const providerPrefix = parts[0]?.toLowerCase() || '';

    const result = this._routeToProvider(providerPrefix, model, apiKeys, providerSettings?.[this.name], undefined);

    if (!result) {
      throw new Error(`Could not create model instance for ${model}`);
    }

    return result;
  }

  /**
   * Route model request to the appropriate backend provider
   */
  private _routeToProvider(
    provider: string,
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const normalizedProvider = provider.toLowerCase().replace(/[^a-z0-9]/g, '');

    switch (normalizedProvider) {
      case 'openai':
        return this._createOpenAIModel(model, apiKeys, settings, serverEnv);
      case 'anthropic':
        return this._createAnthropicModel(model, apiKeys, settings, serverEnv);
      case 'google':
      case 'gemini':
        return this._createGoogleModel(model, apiKeys, settings, serverEnv);
      case 'cohere':
        return this._createCohereModel(model, apiKeys, settings, serverEnv);
      case 'meta':
      case 'llama':
        return this._createMetaModel(model, apiKeys, settings, serverEnv);
      case 'mistral':
        return this._createMistralModel(model, apiKeys, settings, serverEnv);
      case 'xai':
      case 'grok':
        return this._createXAIModel(model, apiKeys, settings, serverEnv);
      case 'groq':
        return this._createGroqModel(model, apiKeys, settings, serverEnv);
      case 'aws':
      case 'bedrock':
        return this._createAWSModel(model, apiKeys, settings, serverEnv);
      case 'together':
        return this._createTogetherModel(model, apiKeys, settings, serverEnv);
      case 'perplexity':
        return this._createPerplexityModel(model, apiKeys, settings, serverEnv);
      case 'huggingface':
        return this._createHuggingFaceModel(model, apiKeys, settings, serverEnv);
      case 'replicate':
        return this._createReplicateModel(model, apiKeys, settings, serverEnv);
      case 'stabilityai':
        return this._createStabilityAIModel(model, apiKeys, settings, serverEnv);
      case 'cerebras':
        return this._createCerebrasModel(model, apiKeys, settings, serverEnv);
      case 'deepinfra':
        return this._createDeepInfraModel(model, apiKeys, settings, serverEnv);
      case 'fireworks':
        return this._createFireworksModel(model, apiKeys, settings, serverEnv);
      case 'nvidia':
        return this._createNvidiaModel(model, apiKeys, settings, serverEnv);
      case '302ai':
      case '302':
        return this._createAggregatorModel('302.AI', model, apiKeys, settings, serverEnv);
      case 'abacusai':
      case 'abacus':
        return this._createAggregatorModel('Abacus AI', model, apiKeys, settings, serverEnv);
      case 'aiHubMix':
      case 'aihmix':
        return this._createAggregatorModel('AIHubMix', model, apiKeys, settings, serverEnv);
      case 'aliyundashscope':
      case 'dashscope':
      case 'alibaba':
        return this._createAggregatorModel('Alibaba DashScope', model, apiKeys, settings, serverEnv);
      default:
        console.warn(`Unknown provider: ${provider}`);
        return null;
    }
  }

  /**
   * Create OpenAI model
   */
  private _createOpenAIModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'OPENAI_BASE_URL',
      defaultApiTokenKey: 'OPENAI_API_KEY',
    });

    if (!apiKey) {
      console.warn('OpenAI API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    return client.languageModel(model);
  }

  /**
   * Create Anthropic model
   */
  private _createAnthropicModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'ANTHROPIC_BASE_URL',
      defaultApiTokenKey: 'ANTHROPIC_API_KEY',
    });

    if (!apiKey) {
      console.warn('Anthropic API key not found');
      return null;
    }

    const client = createAnthropic({
      apiKey,
    });

    return client.languageModel(model);
  }

  /**
   * Create Google model
   */
  private _createGoogleModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'GOOGLE_BASE_URL',
      defaultApiTokenKey: 'GOOGLE_API_KEY',
    });

    if (!apiKey) {
      console.warn('Google API key not found');
      return null;
    }

    const client = createGoogleGenerativeAI({
      apiKey,
    });

    return client.languageModel(model);
  }

  /**
   * Create Cohere model
   */
  private _createCohereModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'COHERE_BASE_URL',
      defaultApiTokenKey: 'COHERE_API_KEY',
    });

    if (!apiKey) {
      console.warn('Cohere API key not found');
      return null;
    }

    const client = createCohere({
      apiKey,
    });

    return client.languageModel(model);
  }

  /**
   * Create Meta/Llama model (stub - requires compatible endpoint)
   */
  private _createMetaModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    // Meta models are typically accessed through aggregators or compatible endpoints
    console.warn('Meta models should be accessed through a compatible provider');
    return null;
  }

  /**
   * Create Mistral model (stub - requires compatible endpoint)
   */
  private _createMistralModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    // Mistral has OpenAI-compatible API
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'MISTRAL_BASE_URL',
      defaultApiTokenKey: 'MISTRAL_API_KEY',
    });

    if (!apiKey) {
      console.warn('Mistral API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.mistral.ai/v1',
    });

    return client.languageModel(model);
  }

  /**
   * Create xAI/Grok model (stub - requires compatible endpoint)
   */
  private _createXAIModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('xAI models require additional configuration');
    return null;
  }

  /**
   * Create Groq model (stub - requires compatible endpoint)
   */
  private _createGroqModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('Groq models require additional configuration');
    return null;
  }

  /**
   * Create AWS/Bedrock model (stub)
   */
  private _createAWSModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('AWS Bedrock models require additional configuration');
    return null;
  }

  /**
   * Create Together model (stub)
   */
  private _createTogetherModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('Together AI models require additional configuration');
    return null;
  }

  /**
   * Create Perplexity model (stub - OpenAI compatible)
   */
  private _createPerplexityModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'PERPLEXITY_BASE_URL',
      defaultApiTokenKey: 'PERPLEXITY_API_KEY',
    });

    if (!apiKey) {
      console.warn('Perplexity API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: 'https://api.perplexity.ai',
    });

    return client.languageModel(model);
  }

  /**
   * Create HuggingFace model (stub)
   */
  private _createHuggingFaceModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('HuggingFace models require additional configuration');
    return null;
  }

  /**
   * Create Replicate model (stub)
   */
  private _createReplicateModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('Replicate models require additional configuration');
    return null;
  }

  /**
   * Create Stability AI model (stub)
   */
  private _createStabilityAIModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('Stability AI models require additional configuration');
    return null;
  }

  /**
   * Create Cerebras model (stub - OpenAI compatible)
   */
  private _createCerebrasModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'CEREBRAS_BASE_URL',
      defaultApiTokenKey: 'CEREBRAS_API_KEY',
    });

    if (!apiKey) {
      console.warn('Cerebras API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: 'https://api.cerebras.ai/v1',
    });

    return client.languageModel(model);
  }

  /**
   * Create Deep Infra model (stub - OpenAI compatible)
   */
  private _createDeepInfraModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'DEEPINFRA_BASE_URL',
      defaultApiTokenKey: 'DEEPINFRA_API_KEY',
    });

    if (!apiKey) {
      console.warn('Deep Infra API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: 'https://api.deepinfra.com/v1/openai',
    });

    return client.languageModel(model);
  }

  /**
   * Create Fireworks model (stub - OpenAI compatible)
   */
  private _createFireworksModel(
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'FIREWORKS_BASE_URL',
      defaultApiTokenKey: 'FIREWORKS_API_KEY',
    });

    if (!apiKey) {
      console.warn('Fireworks API key not found');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: 'https://api.fireworks.ai/inference/v1',
    });

    return client.languageModel(model);
  }

  /**
   * Create NVIDIA model (stub)
   */
  private _createNvidiaModel(
    _model: string,
    _apiKeys?: Record<string, string>,
    _settings?: IProviderSetting,
    _serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    console.warn('NVIDIA models require additional configuration');
    return null;
  }

  /**
   * Create aggregator model (302.AI, Abacus, etc.)
   */
  private _createAggregatorModel(
    aggregator: string,
    model: string,
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): LanguageModelV1 | null {
    const keyMap: Record<string, string> = {
      '302.AI': 'NEOMODELS_302AI_API_KEY',
      'Abacus AI': 'NEOMODELS_ABACUSAI_API_KEY',
      AIHubMix: 'NEOMODELS_AIHMIX_API_KEY',
      'Alibaba DashScope': 'NEOMODELS_DASHSCOPE_API_KEY',
    };

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: `${aggregator.toUpperCase().replace(/[\s.]/g, '_')}_BASE_URL`,
      defaultApiTokenKey: keyMap[aggregator] || `NEOMODELS_${aggregator.toUpperCase()}_API_KEY`,
    });

    if (!apiKey) {
      console.warn(`${aggregator} API key not found`);
      return null;
    }

    // Most aggregators support OpenAI-compatible API
    const client = createOpenAI({
      apiKey,
    });

    return client.languageModel(model);
  }
}
