import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'apps/**',
        'packages/shared/infra-db/**',
        '**/index.ts',
      ],
    },
  },
})
