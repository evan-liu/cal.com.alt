import { mockDb } from '@calcom-alt/infra-db'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../dist/main.js'

let request = require('supertest')

let fastify: FastifyInstance

beforeAll(async () => {
  globalThis.__db = await mockDb()
  fastify = buildApp()
  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

describe('GET /', () => {
  it('returns 200 OK', async () => {
    const res = await request(fastify.server).get('/')
    expect(res.statusCode).toBe(200)
  })
})
