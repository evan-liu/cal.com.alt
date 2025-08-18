import { type Config } from 'drizzle-kit'

let url = process.env.DATABASE_URL

export default {
  out: './drizzle',
  schema: './dist/src/schema.js',
  dialect: 'postgresql',
  dbCredentials: { url },
  driver: url == ':memory:' || url.startsWith('.') ? 'pglite' : undefined,
} satisfies Config
