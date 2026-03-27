/**
 * Alibaba DashScope Provider
 * Chinese LLM platform with proprietary Qwen models and third-party integrations
 * Website: https://dashscope.aliyun.com
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class AlibabaDAshScopeProvider extends BaseProvider {
  name = 'Alibaba DashScope';
  getApiKeyLink = 'https://dashscope.aliyun.com/api-key';
  labelForGetApiKey = 'Get DashScope API Key';

  config = {
    apiTokenKey: 'NEOMODELS_DASHSCOPE_API_KEY',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'qwen-plus',
      label: 'Qwen Plus (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 30000,
      maxCompletionTokens: 8000,
    },
    {
      name: 'qwen-turbo',
      label: 'Qwen Turbo (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 6000,
      maxCompletionTokens: 1500,
    },
    {
      name: 'qwen-long',
      label: 'Qwen Long (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 30000,
      maxCompletionTokens: 8000,
    },
    {
      name: 'qwen-vl-plus',
      label: 'Qwen VL Plus - Vision (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 30000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'claude-3-sonnet',
      label: 'Claude 3 Sonnet (via DashScope)',
      provider: 'Alibaba DashScope',
      maxTokenAllowed: 200000,
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
      defaultBaseUrlKey: 'NEOMODELS_DASHSCOPE_BASE_URL',
      defaultApiTokenKey: 'NEOMODELS_DASHSCOPE_API_KEY',
    });

    if (!apiKey) {
      return this.staticModels;
    }

    try {
      // DashScope model listing
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch DashScope models');
        return this.staticModels;
      }

      const data = (await response.json()) as { data?: Array<{ id: string }> };
      const models: ModelInfo[] = (data.data || []).map((model: any) => ({
        name: model.id,
        label: model.id,
        provider: 'Alibaba DashScope',
        maxTokenAllowed: 30000,
        maxCompletionTokens: 8000,
      }));

      return models.length > 0 ? models : this.staticModels;
    } catch (error) {
      console.error('Error fetching DashScope models:', error);
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
      defaultApiTokenKey: 'NEOMODELS_DASHSCOPE_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const client = createOpenAI({
      apiKey,
      baseURL: baseUrl || 'https://dashscope.aliyuncs.com/api/v1',
    });

    return client.languageModel(model);
  }
}
