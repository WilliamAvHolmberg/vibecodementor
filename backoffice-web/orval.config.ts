export default {
  api: {
    input: 'http://localhost:5001/swagger/v1/swagger.json',
    output: {
      target: 'src/api/generated.ts',
      client: 'react-query',
      httpClient: 'fetch',
      prettier: true,
    },
  },
} as const;


