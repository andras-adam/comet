import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'


export default defineWorkersConfig({
  test: {
    coverage: {
      provider: 'istanbul'
    },
    include: [ '**/test/**/*.ts' ],
    exclude: [ '**/test/**/*.d.ts' ],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' }
      }
    }
  }
})
