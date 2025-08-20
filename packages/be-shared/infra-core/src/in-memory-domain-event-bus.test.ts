import {
  AbstractDomainEvent,
  type DomainEvent,
  type DomainEventListener,
  onDomainEvent,
} from '@calcom-alt/ddd-lite'
import { setLogger } from '@calcom-alt/runtime-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryDomainEventBus } from './in-memory-domain-event-bus.js'

/* eslint-disable @typescript-eslint/no-empty-function */

class TestDomainEvent extends AbstractDomainEvent {}

class AnotherDomainEvent extends AbstractDomainEvent {}

class TestListener implements DomainEventListener {
  @onDomainEvent(TestDomainEvent)
  onTestDomainEvent() {}

  @onDomainEvent(AnotherDomainEvent)
  onAnotherDomainEvent() {}

  @onDomainEvent(TestDomainEvent)
  onTestDomainEvent2() {}
}

describe('InMemoryDomainEventBus', () => {
  beforeEach(() => {
    setLogger(() => ({ warn: vi.fn(), error: vi.fn() }) as any)
  })

  describe('publish()', () => {
    it('should invoke a registered listener for an event', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      domainEventBus.addListener(listener)

      vi.spyOn(listener, 'onTestDomainEvent')

      let event = new TestDomainEvent()
      await domainEventBus.publish(event)

      expect(listener.onTestDomainEvent).toHaveBeenCalledWith(event)
    })

    it('should invoke multiple handlers registered for the same event', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      domainEventBus.addListener(listener)

      vi.spyOn(listener, 'onTestDomainEvent')
      vi.spyOn(listener, 'onTestDomainEvent2')

      await domainEventBus.publish(new TestDomainEvent())

      expect(listener.onTestDomainEvent).toHaveBeenCalled()
      expect(listener.onTestDomainEvent2).toHaveBeenCalled()
    })

    it('should allow one method to handle multiple event types', async () => {
      class MultiEventListener implements DomainEventListener {
        handled: string[] = []

        @onDomainEvent(TestDomainEvent)
        @onDomainEvent(AnotherDomainEvent)
        onAnyEvent(e: DomainEvent) {
          this.handled.push(e.constructor.name)
        }
      }

      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new MultiEventListener()
      domainEventBus.addListener(listener)

      await domainEventBus.publish(new TestDomainEvent())
      await domainEventBus.publish(new AnotherDomainEvent())

      expect(listener.handled).toEqual([
        'TestDomainEvent',
        'AnotherDomainEvent',
      ])
    })

    it('should run handlers non-blocking', async () => {
      vi.useFakeTimers()

      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()

      let handlerFinished = false
      listener.onTestDomainEvent = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        handlerFinished = true
      }

      domainEventBus.addListener(listener)
      let publishPromise = domainEventBus.publish(new TestDomainEvent())

      await publishPromise
      expect(handlerFinished).toBe(false)

      await vi.runAllTimersAsync()
      expect(handlerFinished).toBe(true)

      vi.useRealTimers()
    })

    it('should do nothing if no handlers are registered for the event', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let event = new TestDomainEvent()
      await expect(domainEventBus.publish(event)).resolves.toBeUndefined()
    })
  })

  describe('addListener()', () => {
    it('should register listener instance correctly', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      vi.spyOn(listener, 'onTestDomainEvent')

      domainEventBus.addListener(listener)
      await domainEventBus.publish(new TestDomainEvent())

      expect(listener.onTestDomainEvent).toHaveBeenCalled()
    })

    it('should register listener class correctly', async () => {
      class TestListenerType implements DomainEventListener {
        static lastInstance: TestListenerType
        constructor() {
          TestListenerType.lastInstance = this
        }
        @onDomainEvent(TestDomainEvent)
        onTestDomainEvent() {}
      }

      let domainEventBus = new InMemoryDomainEventBus()
      domainEventBus.addListener(TestListenerType)
      expect(TestListenerType.lastInstance).toBeDefined()

      vi.spyOn(TestListenerType.lastInstance, 'onTestDomainEvent')

      await domainEventBus.publish(new TestDomainEvent())
      expect(TestListenerType.lastInstance.onTestDomainEvent).toHaveBeenCalled()
    })

    it('should not register the same listener twice', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      vi.spyOn(listener, 'onTestDomainEvent')

      domainEventBus.addListener(listener)
      domainEventBus.addListener(listener)

      await domainEventBus.publish(new TestDomainEvent())

      expect(listener.onTestDomainEvent).toHaveBeenCalledTimes(1)
    })

    it('should not register the same handler twice for the same event', async () => {
      class DuplicateHandlerListener implements DomainEventListener {
        calls = 0

        @onDomainEvent(TestDomainEvent)
        @onDomainEvent(TestDomainEvent)
        onTest() {
          this.calls++
        }
      }

      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new DuplicateHandlerListener()
      domainEventBus.addListener(listener)

      await domainEventBus.publish(new TestDomainEvent())
      expect(listener.calls).toBe(1)
    })
  })

  describe('addListeners()', () => {
    it('should register multiple listeners', async () => {
      class TestListener2 implements DomainEventListener {
        @onDomainEvent(TestDomainEvent)
        onTestDomainEvent() {}
      }

      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      let listener2 = new TestListener2()
      vi.spyOn(listener, 'onTestDomainEvent')
      vi.spyOn(listener2, 'onTestDomainEvent')

      domainEventBus.addListeners([listener, listener2])
      await domainEventBus.publish(new TestDomainEvent())

      expect(listener.onTestDomainEvent).toHaveBeenCalled()
      expect(listener2.onTestDomainEvent).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should continue processing events when handler throws', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      vi.spyOn(listener, 'onTestDomainEvent').mockImplementation(() =>
        Promise.reject('Test error'),
      )
      vi.spyOn(listener, 'onTestDomainEvent2')

      domainEventBus.addListener(listener)
      await domainEventBus.publish(new TestDomainEvent())

      expect(listener.onTestDomainEvent2).toHaveBeenCalled()
    })
  })

  describe('multiple event types', () => {
    it('should handle different event types independently', async () => {
      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new TestListener()
      vi.spyOn(listener, 'onTestDomainEvent')
      vi.spyOn(listener, 'onAnotherDomainEvent')

      domainEventBus.addListener(listener)
      await domainEventBus.publish(new TestDomainEvent())
      await domainEventBus.publish(new AnotherDomainEvent())

      expect(listener.onTestDomainEvent).toHaveBeenCalled()
      expect(listener.onAnotherDomainEvent).toHaveBeenCalled()
    })
  })

  describe('custom event names', () => {
    it('should use eventName property instead of constructor name when available', async () => {
      class EventWithCustomName extends AbstractDomainEvent {
        static eventName = 'testing.customEvent'
      }

      class BothNamesListener implements DomainEventListener {
        @onDomainEvent('testing.customEvent')
        onOverriddenEvent() {}

        @onDomainEvent(EventWithCustomName)
        onEventByClass() {}
      }

      let domainEventBus = new InMemoryDomainEventBus()
      let listener = new BothNamesListener()
      vi.spyOn(listener, 'onOverriddenEvent')
      vi.spyOn(listener, 'onEventByClass')

      domainEventBus.addListener(listener)
      await domainEventBus.publish(new EventWithCustomName())

      expect(listener.onOverriddenEvent).toHaveBeenCalled()
      expect(listener.onEventByClass).toHaveBeenCalled()
    })
  })
})
