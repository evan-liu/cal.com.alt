import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.get('/v2/bookings/:uid', async function (request, reply) {
    let { uid } = request.params as { uid: string }
    return {}
  })

  fastify.post('/v2/event-types/:id/bookings', async function (request, reply) {
    let { id } = request.params as { id: string }
    let booking = request.body
    return {}
  })
}
