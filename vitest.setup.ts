import { afterEach } from 'vitest'
import { serviceLocator } from './packages/shared/service-locator/src/index.js'

afterEach(() => {
  serviceLocator.reset()
})
