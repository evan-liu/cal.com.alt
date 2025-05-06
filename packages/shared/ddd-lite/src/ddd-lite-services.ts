import type { DomainEventBus } from './domain-event/domain-event-bus.js'

/**
 * Service locator for ddd-lite services.
 * Call `registerServices()` at the application startup to initialize.
 */

export let dddLiteServices = {} as {
  eventBus: DomainEventBus
}
