import { randomUUID } from 'node:crypto'

/**
 * Domain events are plain objects published to the `DomainEventBus`.
 *
 * The event name used for routing is determined by:
 * 1. The static `eventName` property on the event class (if present)
 * 2. The constructor name of the event class (fallback)
 *
 * @example ```
 * // Using constructor name as event name
 * class BookingCreated implements DomainEvent { ... }
 *
 * // Using custom event name
 * class BookingRescheduled implements DomainEvent {
 *   static readonly eventName = "booking.rescheduled";
 *   ...
 * }
 * ```
 */
export interface DomainEvent {
  /** The time the event occurred. */
  readonly occurredAt: Date

  /** A unique ID for the event. */
  readonly eventId: string
}

/**
 * Constructor type for domain events.
 * Used to infer the event name (via `.name` or `.eventName`).
 */
export interface DomainEventCtor {
  /** Optional override for the event name (defaults to `.name`). */
  readonly eventName?: string

  /** The constructor function to get `.name` as the event name. */
  new (...args: any[]): DomainEvent // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Abstract domain event base class that provides default values for `occurredAt` and `eventId`. */
export abstract class AbstractDomainEvent implements DomainEvent {
  constructor(
    public readonly occurredAt = new Date(),
    public readonly eventId = randomUUID(),
  ) {}
}
