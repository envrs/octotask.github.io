/**
 * Abacus AI Provider
 * Multi-model platform with focus on LLM and data analysis
 * Website: https://abacusai.com
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class AbacusAIProvider extends BaseProvider {
  name = 'Abacus AI';
  getApiKeyLink = 'https://app.abacusai.com/api/keys';
  labelForGetApiKey = 'Get Abacus AI API Key';

  config = {
    apiTokenKey: 'NEOMODELS_ABACUSAI_API_KEY',
    baseUrl: 'https://api.abacusai.com/v1',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'llama-2-70b',
      label: 'Llama 2 70B (via Abacus AI)',
      provider: 'Abacus AI',
      maxTokenAllowed: 4096,
      maxCompletionTokens: 2048,
    },
    {
      name: 'mistral-7b',
      label: 'Mistral 7B (via Abacus AI)',
      provider: 'Abacus AI',
      maxTokenAllowed: 8000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'neural-chat-7b',
      label: 'Neural Chat 7B (via Abacus AI)',
      provider: 'Abacus AI',
      maxTokenAllowed: 4096,
      maxCompletionTokens: 2048,
    },
    {
      name: 'zephyr-7b-beta',
      label: 'Zephyr 7B Beta (via Abacus AI)',
      provider: 'Abacus AI',
      maxTokenAllowed: 4096,
      maxCompletionTokens: 2048,
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
      defaultBaseUrlKey: 'NEOMODELS_ABACUSAI_BASE_URL',
      defaultApiTokenKey: 'NEOMODELS_ABACUSAI_API_KEY',
    });

    if (!apiKey) {
      return this.staticModels;
    }

    try {
      // Abacus AI model listing
      const response = await fetch('https://api.abacusai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch Abacus AI models');
        return this.staticModels;
      }

      const data = (await response.json()) as {
        models?: Array<{ id: string; name?: string; contextWindow?: number; maxTokens?: number }>;
      };
      const models: ModelInfo[] = (data.models || []).map((model: any) => ({
        name: model.id,
        label: model.name || model.id,
        provider: 'Abacus AI',
        maxTokenAllowed: model.contextWindow || 4096,
        maxCompletionTokens: model.maxTokens || 2048,
      }));

      return models.length > 0 ? models : this.staticModels;
    } catch (error) {
      console.error('Error fetching Abacus AI models:', error);
      return this.staticModels;
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'NEOMODELS_ABACUSAI_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.abacusai.com/v1',
    });

    return client.languageModel(model);
  }
}
