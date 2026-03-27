import { defineConfig } from '@remix-run/dev';
import { flatRoutes } from 'remix-flat-routes';

export default defineConfig({
  // Use flat routes instead of nested routing
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes);
  },
  // Build output directories for Vercel
  buildDirectory: 'build/server',
  serverBuildPath: 'build/server/index.js',
  assetsBuildDirectory: 'build/client/assets',
  publicPath: '/assets/',
  // Server options
  server: 'build/server/index.js',
  // Dev server config
  dev: {
    port: 3000,
  },
  // TypeScript
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
  },
});
