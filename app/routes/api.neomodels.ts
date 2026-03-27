/**
 * Neomodels API Route
 * Provides comprehensive search and filtering for 1000+ models from neomodels.vercel.app
 */

import { json } from '@remix-run/node';
import { getNeomodelsDatabase } from '~/lib/neomodels';
import type { NeoModel } from '~/lib/neomodels';

interface NeomodelsResponse {
  success: boolean;
  data?: any;
  error?: string;
  cacheStats?: {
    isInitialized: boolean;
    modelsCount: number;
    providersCount: number;
    lastUpdated: number | null;
    cacheExpiry: number | null;
  };
}

export async function loader({ request }: { request: Request }): Promise<Response> {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'search';
    const db = getNeomodelsDatabase();

    switch (action) {
      case 'search': {
        const query = url.searchParams.get('q') || undefined;
        const provider = url.searchParams.get('provider') || undefined;
        const category = url.searchParams.get('category') as any;
        const sortBy = (url.searchParams.get('sortBy') as any) || 'name';
        const sortOrder = (url.searchParams.get('sortOrder') as any) || 'asc';
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const result = await db.search({
          query,
          provider,
          category,
          sortBy,
          sortOrder,
          limit,
          offset,
        });

        return json<NeomodelsResponse>({
          success: true,
          data: result,
          cacheStats: db.getCacheStats(),
        });
      }

      case 'providers': {
        const providers = await db.getProviders();
        return json<NeomodelsResponse>({
          success: true,
          data: {
            providers: providers.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              website: p.website,
              enabled: p.enabled,
              modelCount: p.models.length,
            })),
          },
          cacheStats: db.getCacheStats(),
        });
      }

      case 'model': {
        const modelId = url.searchParams.get('id');

        if (!modelId) {
          return json<NeomodelsResponse>(
            {
              success: false,
              error: 'Model ID is required',
            },
            { status: 400 },
          );
        }

        const model = await db.getModel(modelId);

        if (!model) {
          return json<NeomodelsResponse>(
            {
              success: false,
              error: 'Model not found',
            },
            { status: 404 },
          );
        }

        return json<NeomodelsResponse>({
          success: true,
          data: { model },
        });
      }

      case 'categories': {
        const categories = ['text', 'vision', 'audio', 'multimodal', 'embedding'];
        const categorizedModels: Record<string, NeoModel[]> = {};

        for (const category of categories) {
          categorizedModels[category] = await db.getModelsByCategory(category as any);
        }

        return json<NeomodelsResponse>({
          success: true,
          data: categorizedModels,
          cacheStats: db.getCacheStats(),
        });
      }

      case 'stats': {
        return json<NeomodelsResponse>({
          success: true,
          data: db.getCacheStats(),
        });
      }

      case 'refresh': {
        // Force refresh the cache (admin action - consider adding auth)
        await db.refresh();
        return json<NeomodelsResponse>({
          success: true,
          data: {
            message: 'Neomodels database refreshed',
            stats: db.getCacheStats(),
          },
        });
      }

      default:
        return json<NeomodelsResponse>(
          {
            success: false,
            error: `Unknown action: ${action}`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Neomodels API error:', error);
    return json<NeomodelsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
