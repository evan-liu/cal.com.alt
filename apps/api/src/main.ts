import { dddLiteServices } from '@calcom-alt/ddd-lite'
import { InMemoryDomainEventBus } from '@calcom-alt/infra-core'
import { registerServices, runtimeServices } from '@calcom-alt/runtime-core'
import Fastify from 'fastify'
import { app } from './app/app.js'

let host = process.env.HOST ?? 'localhost'
let port = process.env.PORT ? Number(process.env.PORT) : 3000

let server = Fastify({
  logger: true,
})

registerServices(runtimeServices, {
  logger: server.log,
})
registerServices(dddLiteServices, {
  eventBus: new InMemoryDomainEventBus(),
})

server.register(app)

server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  } else {
    console.log(`[ ready ] http://${host}:${port}`)
  }
})
