import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { usersTable } from './identity-tables.js'

/* ---------- Schedule & availability ---------- */
export let schedulesTable = pgTable('Schedule', {
  id: serial('id').primaryKey(),
  userId: integer('userId')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  timeZone: text('timeZone'),
  rules: jsonb('rules'), // iCal RRULE set
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

export let availabilitiesTable = pgTable(
  'Availability',
  {
    id: serial('id').primaryKey(),
    scheduleId: integer('scheduleId')
      .references(() => schedulesTable.id, { onDelete: 'cascade' })
      .notNull(),
    date: timestamp('date', { mode: 'date' }).notNull(),
    startTime: timestamp('startTime', { mode: 'date' }).notNull(),
    endTime: timestamp('endTime', { mode: 'date' }).notNull(),
  },
  (t) => [index('avail_schedule_idx').on(t.scheduleId)],
)

/* ---------- Event type & hosts ---------- */
export let eventTypesTable = pgTable(
  'EventType',
  {
    id: serial('id').primaryKey(),
    userId: integer('userId').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    scheduleId: integer('scheduleId').references(() => schedulesTable.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    length: integer('length').notNull(), // minutes
    hidden: boolean('hidden').default(false),
    schedulingType: text('schedulingType')
      .$type<'ROUND_ROBIN' | 'COLLECTIVE' | 'SINGLE'>()
      .default('SINGLE'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('evt_slug_idx').on(t.slug), index('evt_user_idx').on(t.userId)],
)

export let hostsTable = pgTable(
  'Host',
  {
    userId: integer('userId')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    eventTypeId: integer('eventTypeId')
      .references(() => eventTypesTable.id, { onDelete: 'cascade' })
      .notNull(),
    isFixed: boolean('isFixed').default(false),
    priority: integer('priority'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventTypeId] })],
)

/* ---------- Booking core ---------- */
export let bookingsTable = pgTable(
  'Booking',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').unique().notNull(),
    userId: integer('userId').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    eventTypeId: integer('eventTypeId').references(() => eventTypesTable.id, {
      onDelete: 'set null',
    }),
    startTime: timestamp('startTime', { mode: 'date' }).notNull(),
    endTime: timestamp('endTime', { mode: 'date' }).notNull(),
    status: text('status')
      .$type<'CANCELLED' | 'ACCEPTED' | 'PENDING'>()
      .default('ACCEPTED')
      .notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('bk_uid_idx').on(t.uid),
    index('bk_event_idx').on(t.eventTypeId),
  ],
)

/* Optional: simple attendee list */
export let attendeesTable = pgTable(
  'Attendee',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('bookingId').references(() => bookingsTable.id, {
      onDelete: 'cascade',
    }),
    email: text('email').notNull(),
    name: text('name'),
  },
  (t) => [index('att_booking_idx').on(t.bookingId)],
)
