import { describe, expect, it, vi } from 'vitest'
import { serviceLocator } from './service-locator.js'

describe('serviceLocator', () => {
  it('throws when service not registered', () => {
    let [get] = serviceLocator<string>()
    expect(() => get()).toThrow('Service not registered')
  })

  it('creates service from factory', () => {
    let [get, set] = serviceLocator<string>()
    set(() => 'test')
    expect(get()).toBe('test')
  })

  it('returns same instance (singleton)', () => {
    let [get, set] = serviceLocator<{ id: string }>()
    set(() => ({ id: 'test' }))
    expect(get()).toBe(get())
  })

  it('calls factory only once', () => {
    let [get, set] = serviceLocator<string>()
    let spy = vi.fn(() => 'test')
    set(spy)
    get()
    get()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('handles factory errors and recovery', () => {
    let [get, set] = serviceLocator<string>()
    
    // Error object
    set(() => { throw new Error('fail') })
    expect(() => get()).toThrow('Failed to create service: fail')
    
    // Non-Error throw
    set(() => { throw 'string fail' })
    expect(() => get()).toThrow('Failed to create service: string fail')
    
    // Recovery
    set(() => 'success')
    expect(get()).toBe('success')
  })
})
