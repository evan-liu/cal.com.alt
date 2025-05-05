/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { DomainEvent } from './domain-event.js'

/**
 * Marker interface for domain event listeners.
 * A DomainEventListener groups related domain event handlers into a single class
 * so they can be colocated and registered together in the `DomainEventBus`.
 *
 * @example ```
 * class WorkflowBookingListener implements DomainEventListener {
 *   @onDomainEvent(BookingCreated)
 *   async onBookingCreated(event: BookingCreated) {
 *     // Trigger workflows when booking is created
 *   }
 *   @onDomainEvent(BookingCancelled)
 *   async onBookingCancelled(event: BookingCancelled) {
 *     // Trigger workflows when booking is cancelled
 *   }
 * }
 * ```
 */
export interface DomainEventListener {}

/**
 * Constructor type for domain event listeners.
 * Used to instantiate listeners via `new` in event bus registration.
 */
export interface DomainEventListenerCtor {
  new (): DomainEventListener
}

/** DomainEventListener methods with `@onDomainEvent()` decorator. */
export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  (event: T): void | Promise<void>
}
