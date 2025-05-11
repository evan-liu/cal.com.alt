import { PgDatabase } from 'drizzle-orm/pg-core'

// Temporary: Use pglite for local dev
import { drizzle } from 'drizzle-orm/pglite'

// Temporary: Use globalThis.__db so that tests can inject mock db
let global = globalThis as unknown as { __db: PgDatabase<any> | undefined }

export async function connectDb(): Promise<PgDatabase<any>> {
  if (!global.__db) {
    let url = process.env.DATABASE_URL
    global.__db = url ? drizzle(url) : drizzle()
  }
  return global.__db
}
