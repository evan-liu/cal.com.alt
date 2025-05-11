import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.post('/v2/event-types', async function (request, reply) {
    let eventType = request.body
    return {}
  })

  fastify.get('/v2/event-types/:id', async function (request, reply) {
    let { id } = request.params as { id: string }
    return {}
  })
}
