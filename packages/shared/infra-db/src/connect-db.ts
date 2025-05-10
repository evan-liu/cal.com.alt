import { PgDatabase } from 'drizzle-orm/pg-core'

// Use pglite for local dev for now
import { drizzle } from 'drizzle-orm/pglite'

let url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not defined')

let db = drizzle(url)

export async function connectDb(): Promise<PgDatabase<any>> {
  return db
}
