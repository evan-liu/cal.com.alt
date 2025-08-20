import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['apps/**/*.e2e.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'tmp/**',
        'apps/**',
        'packages/be-shared/infra-db/**',
        '**/index.ts',
      ],
    },
  },
})
