let registry = new Map<
  symbol,
  { instance?: unknown; factory?: () => unknown }
>()

/** Service locator with lazy initialization and type safety. */
export let serviceLocator = {
  /**
   * Creates a type-safe service locator for type T.
   *
   * @example
   * let [getLogger, setLogger] = serviceLocator.for<Logger>()
   * setLogger(() => new ConsoleLogger())
   * let logger = getLogger() // Created lazily
   *
   * @returns Tuple of [get, set] functions
   */
  for<T>() {
    let key = Symbol()
    return [
      function get(): T {
        return (registry.get(key)?.instance ?? createInstance(key)) as T
      },
      function set(factory: () => T): void {
        registry.set(key, { factory })
      },
    ] as const
  },

  /** Clears all registered services. Useful for testing. */
  reset() {
    registry.clear()
  },
}

function createInstance(key: symbol) {
  let entry = registry.get(key)
  if (!entry?.factory) {
    throw new Error('Service not registered. Call set() first.')
  }

  try {
    let instance = entry.factory()
    registry.set(key, { instance })
    return instance
  } catch (error) {
    throw new Error(
      `Failed to create service: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
