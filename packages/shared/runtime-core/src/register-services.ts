/**
 * Registers runtime service implementations into a service locator object.
 * Typically called during application startup to inject infrastructure services.
 *
 * @see https://martinfowler.com/articles/injection.html#ServiceLocatorVsDependencyInjection
 *
 * @param locator - The target service locator object to populate.
 * @param services - The services to assign to the locator.
 * @param freeze - Whether to freeze the locator after registration (default: false).
 */
export function registerServices<T extends object>(
  locator: T,
  services: T,
  freeze = false,
) {
  Object.assign(locator, services)
  if (freeze) {
    Object.freeze(locator)
  }
}
