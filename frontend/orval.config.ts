import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:5001/swagger/v1/swagger.json',
      validation: false,
    },
    output: {
      mode: 'split',
      target: './src/api/hooks',
      schemas: './src/api/models',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customApiClient',
        },
        query: {
          useQuery: true,
          options: {
            staleTime: 10000,
            refetchOnWindowFocus: false,
          },
        },
        components: {
          schemas: {
            suffix: 'DTO',
          },
        },
        operations: {
          // Group operations by tags for better organization
        },
      },
    },
  },
}); 