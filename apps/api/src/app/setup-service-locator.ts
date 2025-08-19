import { setEventBus } from '@calcom-alt/ddd-lite'
import { InMemoryDomainEventBus } from '@calcom-alt/infra-core'
import { setLogger } from '@calcom-alt/runtime-core'
import type { FastifyInstance } from 'fastify'

export function setupServiceLocator(fastify: FastifyInstance) {
  setLogger(() => fastify.log)
  setEventBus(() => new InMemoryDomainEventBus())
}
