import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.post('/v2/schedules', async function (request, reply) {
    let schedule = request.body
    return {}
  })

  fastify.get('/v2/schedules/:id', async function (request, reply) {
    let { id } = request.params as { id: string }
    return {}
  })
}
