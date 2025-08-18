/**
 * Creates a type-safe service locator with lazy initialization.
 *
 * @example
 * let [getLogger, setLogger] = serviceLocator<Logger>()
 * setLogger(() => new ConsoleLogger())
 * let logger = getLogger() // Created lazily
 *
 * @returns Tuple of [get, set] functions for the service
 */
export function serviceLocator<T>() {
  let instance: T | undefined
  let factory: (() => T) | undefined

  return [
    function get(): T {
      if (instance) return instance

      if (!factory) {
        throw new Error(
          'Service not registered. Call set() first to register a service factory.',
        )
      }

      try {
        instance = factory()
        factory = undefined // Allow GC of factory and its closures
        return instance
      } catch (error) {
        throw new Error(
          `Failed to create service: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    },

    function set(serviceFactory: () => T): void {
      factory = serviceFactory
    },
  ] as const
}
