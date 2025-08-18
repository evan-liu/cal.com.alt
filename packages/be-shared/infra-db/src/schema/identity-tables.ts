import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

/** Core user record (minimal fields for v2 auth + lookup) */
export let usersTable = pgTable(
  'User',
  {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    username: text('username'),
    name: text('name'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    locked: boolean('locked').default(false),
  },
  (t) => [index('user_email_idx').on(t.email)],
)
