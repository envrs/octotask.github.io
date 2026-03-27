/**
 * 302.AI Provider
 * Multi-model aggregator platform supporting 100+ models from various providers
 * Website: https://302.ai
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class Provider302AI extends BaseProvider {
  name = '302.AI';
  getApiKeyLink = 'https://302.ai/admin/account/key';
  labelForGetApiKey = 'Get 302.AI API Key';

  config = {
    apiTokenKey: 'NEOMODELS_302AI_API_KEY',
    baseUrl: 'https://api.302.ai/v1',
  };

  staticModels: ModelInfo[] = [
    // Popular models available on 302.AI
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo (via 302.AI)',
      provider: '302.AI',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'gpt-4o',
      label: 'GPT-4o (via 302.AI)',
      provider: '302.AI',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'claude-3-opus',
      label: 'Claude 3 Opus (via 302.AI)',
      provider: '302.AI',
      maxTokenAllowed: 200000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'gemini-pro',
      label: 'Gemini Pro (via 302.AI)',
      provider: '302.AI',
      maxTokenAllowed: 32000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'mixtral-8x7b',
      label: 'Mixtral 8x7B (via 302.AI)',
      provider: '302.AI',
      maxTokenAllowed: 32000,
      maxCompletionTokens: 4096,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'NEOMODELS_302AI_BASE_URL',
      defaultApiTokenKey: 'NEOMODELS_302AI_API_KEY',
    });

    if (!apiKey) {
      return this.staticModels;
    }

    try {
      // 302.AI OpenAI-compatible API
      const response = await fetch('https://api.302.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch 302.AI models');
        return this.staticModels;
      }

      const data = await response.json();
      const models: ModelInfo[] = (data.data || []).map((model: any) => ({
        name: model.id,
        label: model.id,
        provider: '302.AI',
        maxTokenAllowed: 128000,
        maxCompletionTokens: 4096,
      }));

      return models.length > 0 ? models : this.staticModels;
    } catch (error) {
      console.error('Error fetching 302.AI models:', error);
      return this.staticModels;
    }
  }

  async getLanguageModel(options: {
    model: string;
    apiKeys?: Record<string, string>;
    settings?: IProviderSetting;
    serverEnv?: Record<string, string>;
  }): Promise<LanguageModelV1 | null> {
    const { model, apiKeys, settings, serverEnv } = options;

    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'NEOMODELS_302AI_BASE_URL',
      defaultApiTokenKey: 'NEOMODELS_302AI_API_KEY',
    });

    if (!apiKey) {
      console.warn('302.AI API key not configured');
      return null;
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.302.ai/v1',
    });

    return client.languageModel(model);
  }
}
