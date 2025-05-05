import { describe, expect, it } from 'vitest'
import {
  getDomainEventHandlers,
  registerDomainEventHandler,
} from './domain-event-handlers.js'

describe('registerDomainEventHandler()', () => {
  it('should ignore duplicated events', () => {
    let listener = {}

    registerDomainEventHandler(listener, 'fn', 'evt1')
    registerDomainEventHandler(listener, 'fn', 'evt1')
    registerDomainEventHandler(listener, 'fn', 'evt2')

    expect(getDomainEventHandlers(listener)).toEqual({ fn: ['evt1', 'evt2'] })
  })

  it('should support symbol', () => {
    let listener = {}
    let fn = Symbol('fn')

    registerDomainEventHandler(listener, fn, 'evt')

    expect(getDomainEventHandlers(listener)).toEqual({ [fn]: ['evt'] })
  })
})
