/**
 * Registers runtime service implementations into a service locator object.
 * Typically called during application startup to inject infrastructure services.
 *
 * @see https://martinfowler.com/articles/injection.html#ServiceLocatorVsDependencyInjection
 */
export function registerServices<T extends object>(locator: T, services: T) {
  Object.assign(locator, services)
}
