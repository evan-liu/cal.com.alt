import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export let usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
})
