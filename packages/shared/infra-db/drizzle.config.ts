import { type Config } from 'drizzle-kit'

let url = process.env.DATABASE_URL

export default {
  out: './drizzle',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url },
  driver: url == ':memory:' || url.startsWith('.') ? 'pglite' : undefined,
} satisfies Config
