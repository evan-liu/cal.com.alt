import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.post('/v2/auth/token', async function () {
    return {}
  })
}
