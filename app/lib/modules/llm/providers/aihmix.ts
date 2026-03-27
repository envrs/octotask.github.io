/**
 * AIHubMix Provider
 * Unified API for multiple model providers with cost optimization
 * Website: https://aihmix.com
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class AIHubMixProvider extends BaseProvider {
  name = 'AIHubMix';
  getApiKeyLink = 'https://aihmix.com/api-keys';
  labelForGetApiKey = 'Get AIHubMix API Key';

  config = {
    apiTokenKey: 'NEOMODELS_AIHMIX_API_KEY',
    baseUrl: 'https://api.aihmix.com/v1',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo (via AIHubMix)',
      provider: 'AIHubMix',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo (via AIHubMix)',
      provider: 'AIHubMix',
      maxTokenAllowed: 16000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'claude-3-sonnet',
      label: 'Claude 3 Sonnet (via AIHubMix)',
      provider: 'AIHubMix',
      maxTokenAllowed: 200000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'gemini-1.5-pro',
      label: 'Gemini 1.5 Pro (via AIHubMix)',
      provider: 'AIHubMix',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'text-davinci-003',
      label: 'Text Davinci 003 (via AIHubMix)',
      provider: 'AIHubMix',
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
      defaultBaseUrlKey: 'NEOMODELS_AIHMIX_BASE_URL',
      defaultApiTokenKey: 'NEOMODELS_AIHMIX_API_KEY',
    });

    if (!apiKey) {
      return this.staticModels;
    }

    try {
      // AIHubMix model listing
      const response = await fetch('https://api.aihmix.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch AIHubMix models');
        return this.staticModels;
      }

      const data = (await response.json()) as { data?: Array<{ id: string }> };
      const models: ModelInfo[] = (data.data || []).map((model: any) => ({
        name: model.id,
        label: model.id,
        provider: 'AIHubMix',
        maxTokenAllowed: 128000,
        maxCompletionTokens: 4096,
      }));

      return models.length > 0 ? models : this.staticModels;
    } catch (error) {
      console.error('Error fetching AIHubMix models:', error);
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
      defaultApiTokenKey: 'NEOMODELS_AIHMIX_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.aihmix.com/v1',
    });

    return client.languageModel(model);
  }
}
