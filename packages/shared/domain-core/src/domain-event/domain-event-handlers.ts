/* eslint-disable @typescript-eslint/no-explicit-any */

let domainEventHandlers = Symbol('domainEventHandlers')
type DomainEventHandlers = Record<string | symbol, string[]>

export function registerDomainEventHandler(
  listener: { [domainEventHandlers]?: DomainEventHandlers },
  method: string | symbol,
  domainEventName: string,
) {
  if (!listener[domainEventHandlers]) {
    listener[domainEventHandlers] = { [method]: [domainEventName] }
    return
  }

  if (!listener[domainEventHandlers][method]) {
    listener[domainEventHandlers][method] = [domainEventName]
    return
  }

  if (!listener[domainEventHandlers][method].includes(domainEventName)) {
    listener[domainEventHandlers][method].push(domainEventName)
  }
}

export function getDomainEventHandlers(listener: any): DomainEventHandlers {
  return listener[domainEventHandlers] || {}
}
