import { registerDomainEventHandler } from './domain-event-handlers.js'
import type { DomainEventCtor } from './domain-event.js'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function onDomainEvent(domainEvent: string | DomainEventCtor) {
  return function (_: any, context: ClassMethodDecoratorContext) {
    context.addInitializer(function () {
      registerDomainEventHandler(
        this as any,
        context.name,
        typeof domainEvent == 'string'
          ? domainEvent
          : domainEvent.eventName || domainEvent.name,
      )
    })
  }
}
