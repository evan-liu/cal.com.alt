import {
  type DomainEvent,
  type DomainEventBus,
  type DomainEventCtor,
  type DomainEventHandler,
  type DomainEventListener,
  type DomainEventListenerCtor,
  getDomainEventHandlers,
} from '@calcom-alt/domain-core'

/** In-memory implementation of DomainEventBus. */
export class InMemoryDomainEventBus implements DomainEventBus {
  private listeners = new Set<DomainEventListenerCtor>()
  private handlersByEventName = new Map<string, DomainEventHandler[]>()

  async publish(target: DomainEvent | DomainEvent[]): Promise<void> {
    for (let event of Array.isArray(target) ? target : [target]) {
      let eventCtor = event?.constructor as DomainEventCtor
      let eventName = eventCtor?.eventName || eventCtor?.name
      let handlers = this.handlersByEventName.get(eventName)
      if (handlers?.length) {
        await Promise.all(handlers.map((handler) => handler(event)))
      }
    }
  }

  addListener(target: DomainEventListener | DomainEventListenerCtor): void {
    let listener: DomainEventListener
    let ListenerCtor: DomainEventListenerCtor
    if (
      typeof target == 'function' &&
      target.prototype?.constructor == target
    ) {
      ListenerCtor = target as DomainEventListenerCtor
      listener = new ListenerCtor()
    } else {
      listener = target as DomainEventListener
      ListenerCtor = target.constructor as DomainEventListenerCtor
    }

    if (this.listeners.has(ListenerCtor)) {
      console.warn(`DomainEventListener ${ListenerCtor.name} is already added.`)
      return
    }

    this.listeners.add(ListenerCtor)

    let self = listener as { [key: string | symbol]: DomainEventHandler }
    let listenerHandlers = getDomainEventHandlers(listener)
    Object.entries(listenerHandlers).forEach(([method, domainEventNames]) => {
      let handler: DomainEventHandler = async (event) => {
        try {
          await self[method]?.(event)
        } catch (err) {
          console.error(`${ListenerCtor.name}.${method}()`, err)
        }
      }
      domainEventNames.forEach((domainEventName) => {
        let handlers = this.handlersByEventName.get(domainEventName)
        if (handlers) {
          handlers.push(handler)
        } else {
          this.handlersByEventName.set(domainEventName, [handler])
        }
      })
    })
  }

  addListeners(
    listeners: ReadonlyArray<DomainEventListener | DomainEventListenerCtor>,
  ): void {
    listeners.forEach((listener) => this.addListener(listener))
  }
}
