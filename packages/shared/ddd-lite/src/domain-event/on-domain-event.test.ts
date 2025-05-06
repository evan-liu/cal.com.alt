import { describe, expect, it } from 'vitest'
import { getDomainEventHandlers } from './domain-event-handlers.js'
import type { DomainEventListener } from './domain-event-listener.js'
import { AbstractDomainEvent } from './domain-event.js'
import { onDomainEvent } from './on-domain-event.js'

/* eslint-disable @typescript-eslint/no-empty-function */

class TestDomainEvent extends AbstractDomainEvent {}

class AnotherDomainEvent extends AbstractDomainEvent {
  static readonly eventName = 'another.event'
}

describe('@onDomainEvent()', () => {
  it('should register domain event via constructor name', () => {
    class TestListener implements DomainEventListener {
      @onDomainEvent(TestDomainEvent)
      onTestDomainEvent() {}
    }
    expect(getDomainEventHandlers(new TestListener())).toEqual({
      onTestDomainEvent: ['TestDomainEvent'],
    })
  })

  it('should register domain event via static var eventName', () => {
    class TestListener implements DomainEventListener {
      @onDomainEvent(AnotherDomainEvent)
      onTestDomainEvent() {}
    }
    expect(getDomainEventHandlers(new TestListener())).toEqual({
      onTestDomainEvent: ['another.event'],
    })
  })

  it('should register domain event via event name param', () => {
    class TestListener implements DomainEventListener {
      @onDomainEvent('another.event')
      onTestDomainEvent() {}
    }
    expect(getDomainEventHandlers(new TestListener())).toEqual({
      onTestDomainEvent: ['another.event'],
    })
  })

  it('should allow multiple handlers on multiple domain events', () => {
    class TestListener implements DomainEventListener {
      @onDomainEvent(TestDomainEvent)
      onTestDomainEvent() {}

      @onDomainEvent(TestDomainEvent)
      @onDomainEvent(AnotherDomainEvent)
      onAnotherDomainEvent() {}

      @onDomainEvent('another.event')
      onTestDomainEvent2() {}
    }

    expect(getDomainEventHandlers(new TestListener())).toEqual({
      onTestDomainEvent: ['TestDomainEvent'],
      onAnotherDomainEvent: ['another.event', 'TestDomainEvent'],
      onTestDomainEvent2: ['another.event'],
    })
  })
})
