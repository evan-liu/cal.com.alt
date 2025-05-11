import { dddLiteServices } from '@calcom-alt/ddd-lite'
import { InMemoryDomainEventBus } from '@calcom-alt/infra-core'
import { registerServices, runtimeServices } from '@calcom-alt/runtime-core'
import type { FastifyInstance } from 'fastify'

export function serviceLocator(fastify: FastifyInstance) {
  registerServices(runtimeServices, {
    logger: fastify.log,
  })

  registerServices(dddLiteServices, {
    eventBus: new InMemoryDomainEventBus(),
  })
}
