import Fastify from 'fastify'
import { app } from './app/app.js'
import { setupServiceLocator } from './app/setup-service-locator'

let host = process.env.HOST ?? 'localhost'
let port = process.env.PORT ? Number(process.env.PORT) : 3000

// Temporary: Skip in e2e tests
if (!process.env.VITEST) {
  let fastify = buildApp()
  fastify.listen({ port, host }, (err) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    } else {
      console.log(`[ ready ] http://${host}:${port}`)
    }
  })
}

export function buildApp() {
  let fastify = Fastify({
    logger: true,
  })

  fastify.register(setupServiceLocator)

  fastify.register(app)

  return fastify
}
