import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.post('/v2/users', async function (request, reply) {
    let user = request.body
    return {}
  })

  // GET /v2/users/:id
  fastify.get('/v2/users/:id', async function (request, reply) {
    let { id } = request.params as { id: number }
    return {}
  })
}
