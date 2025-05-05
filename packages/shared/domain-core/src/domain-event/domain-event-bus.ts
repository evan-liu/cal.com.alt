import type {
  DomainEventListener,
  DomainEventListenerCtor,
} from './domain-event-listener.js'
import type { DomainEvent } from './domain-event.js'

/**
 * Central event bus for publishing and handling domain events.
 */
export interface DomainEventBus {
  /**
   * Publish one or multiple domain event.
   * @note It is an async function and should be awaited.
   */
  publish(event: DomainEvent | DomainEvent[]): Promise<void>

  /** Registers a single DomainEventListener with the event bus */
  addListener(listener: DomainEventListener | DomainEventListenerCtor): void

  /** Registers multiple listeners with the event bus */
  addListeners(
    listeners: ReadonlyArray<DomainEventListener | DomainEventListenerCtor>,
  ): void
}
