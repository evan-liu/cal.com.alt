import type { Logger } from './logger.js'

/**
 * Service locator for runtime dependencies.
 * Call `registerServices()` at the application startup to initialize.
 */
export let runtimeServices = {} as {
  logger: Logger
}
