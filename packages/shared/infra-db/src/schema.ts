/* --------------------------------------------------------------
   Core‑domain schema (Scheduling) + minimal support
   -------------------------------------------------------------- */

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
  uuid,
} from 'drizzle-orm/pg-core'

/* ==================== Supporting tables ==================== */

/** Minimal User representation (identity context) */
export let users = pgTable(
  'User',
  {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    username: text('username'),
    timeZone: text('timeZone').default('UTC').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('user_email_idx').on(t.email)],
)

/** Minimal Team / Organization representation */
export let teams = pgTable(
  'Team',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('team_slug_idx').on(t.slug)],
)

/** Team membership to grant hosts/bookers */
export let memberships = pgTable(
  'Membership',
  {
    teamId: integer('teamId')
      .references(() => teams.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('userId')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').$type<'OWNER' | 'ADMIN' | 'MEMBER'>().notNull(),
    accepted: boolean('accepted').default(false),
  },
  (t) => [
    primaryKey({ columns: [t.teamId, t.userId] }),
    index('membership_role_idx').on(t.role),
  ],
)

/* ==================== Scheduling core ==================== */

/** Shared schedule (recurring rules) */
export let schedules = pgTable('Schedule', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('ownerUserId').references(() => users.id, {
    onDelete: 'cascade',
  }),
  ownerTeamId: integer('ownerTeamId').references(() => teams.id, {
    onDelete: 'cascade',
  }),
  title: text('title').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
  rules: jsonb('rules').notNull(), // iCal RRULE set
  startDate: timestamp('startDate', { mode: 'date' }).notNull(),
  endDate: timestamp('endDate', { mode: 'date' }),
})

/** Day‑level availability generated from Schedule */
export let availabilities = pgTable(
  'Availability',
  {
    scheduleId: integer('scheduleId')
      .references(() => schedules.id, { onDelete: 'cascade' })
      .notNull(),
    date: timestamp('date', { mode: 'date' }).notNull(),
    startMinutes: integer('startMinutes').notNull(),
    endMinutes: integer('endMinutes').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.scheduleId, t.date, t.startMinutes] }),
    index('availability_date_idx').on(t.date),
  ],
)

/** Event (meeting) template */
export let eventTypes = pgTable(
  'EventType',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    length: integer('length').notNull(), // minutes
    hidden: boolean('hidden').default(false),
    schedulingType: text('schedulingType')
      .$type<'ROUND_ROBIN' | 'COLLECTIVE' | 'SINGLE'>()
      .default('SINGLE')
      .notNull(),
    userId: integer('userId').references(() => users.id, {
      onDelete: 'set null',
    }),
    teamId: integer('teamId').references(() => teams.id, {
      onDelete: 'set null',
    }),
    scheduleId: integer('scheduleId').references(() => schedules.id, {
      onDelete: 'set null',
    }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('eventtype_slug_idx').on(t.slug),
    index('eventtype_user_idx').on(t.userId),
    index('eventtype_team_idx').on(t.teamId),
  ],
)

/** Host association for round‑robin / collective events */
export let hosts = pgTable(
  'Host',
  {
    userId: integer('userId')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    eventTypeId: integer('eventTypeId')
      .references(() => eventTypes.id, { onDelete: 'cascade' })
      .notNull(),
    isFixed: boolean('isFixed').default(false),
    priority: integer('priority'),
    weight: integer('weight'),
    scheduleId: integer('scheduleId').references(() => schedules.id),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.eventTypeId] }),
    index('host_evt_idx').on(t.eventTypeId),
  ],
)

/** Booking (actual meeting instance) */
export let bookings = pgTable(
  'Booking',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').unique().notNull(),
    userId: integer('userId').references(() => users.id, {
      onDelete: 'set null',
    }),
    eventTypeId: integer('eventTypeId').references(() => eventTypes.id, {
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
    index('booking_uid_idx').on(t.uid),
    index('booking_user_idx').on(t.userId),
    index('booking_eventtype_idx').on(t.eventTypeId),
    index('booking_start_idx').on(t.startTime),
  ],
)

/* ---------- Calendar integration support ---------- */
export let credentials = pgTable('Credential', {
  id: serial('id').primaryKey(),
  userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt', { mode: 'date' }),
})

export let delegationCredentials = pgTable('DelegationCredential', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
})

export let domainWideDelegations = pgTable('DomainWideDelegation', {
  id: uuid('id').primaryKey(),
  customerId: text('customerId').notNull(),
})

export let destinationCalendars = pgTable('DestinationCalendar', {
  id: serial('id').primaryKey(),
  integration: text('integration').notNull(),
  externalId: text('externalId').notNull(),
  userId: integer('userId')
    .references(() => users.id)
    .unique(),
  eventTypeId: integer('eventTypeId')
    .references(() => eventTypes.id)
    .unique(),
  credentialId: integer('credentialId').references(() => credentials.id),
})

export let selectedCalendars = pgTable('SelectedCalendar', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  integration: text('integration').notNull(),
  externalId: text('externalId').notNull(),
  credentialId: integer('credentialId').references(() => credentials.id),
  eventTypeId: integer('eventTypeId').references(() => eventTypes.id),
})

/* ---------- Booking auxiliaries ---------- */
export let bookingReferences = pgTable('BookingReference', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  uid: text('uid').notNull(),
  bookingId: integer('bookingId').references(() => bookings.id, {
    onDelete: 'cascade',
  }),
  credentialId: integer('credentialId').references(() => credentials.id),
})

export let attendees = pgTable('Attendee', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  timeZone: text('timeZone'),
  bookingId: integer('bookingId').references(() => bookings.id, {
    onDelete: 'cascade',
  }),
})

export let bookingSeats = pgTable('BookingSeat', {
  id: serial('id').primaryKey(),
  bookingId: integer('bookingId').references(() => bookings.id, {
    onDelete: 'cascade',
  }),
  seatNumber: integer('seatNumber'),
})

export let payments = pgTable('Payment', {
  id: serial('id').primaryKey(),
  bookingId: integer('bookingId').references(() => bookings.id, {
    onDelete: 'cascade',
  }),
  amountCents: integer('amountCents').notNull(),
  currency: text('currency').default('usd'),
  success: boolean('success').default(false),
  refunded: boolean('refunded').default(false),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})
