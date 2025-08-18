import type { PgDatabase } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from '../schema.js'

// use require to defeat dynamic require error
// (https://github.com/drizzle-team/drizzle-orm/issues/2853#issuecomment-2668459509)
let { pushSchema } = require('drizzle-kit/api')

export async function mockDb(): Promise<PgDatabase<any>> {
  let db = drizzle()

  let { apply } = await pushSchema(schema, db)
  await apply()

  return db
}
