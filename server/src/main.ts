import dotenv from 'dotenv'
import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import fastifyIO from 'fastify-socket.io'
import { Redis } from 'ioredis'

dotenv.config()

const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL

const CONNECTION_COUNT_KEY = 'chat:connection-count'

// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";
// const NEW_MESSAGE_CHANNEL = "chat:new-message";

if (!UPSTASH_REDIS_REST_URL) {
  console.error('missing UPSTASH_REDIS_REST_URL')
  process.exit(1)
}

const publisher = new Redis(UPSTASH_REDIS_REST_URL)
const subscriber = new Redis(UPSTASH_REDIS_REST_URL)

async function buildServer() {
  const app = fastify()

  await app.register(fastifyCors, {
    origin: CORS_ORIGIN,
  })

  await app.register(fastifyIO)

  const currentCount = await publisher.get(CONNECTION_COUNT_KEY)

  if (!currentCount) {
    await publisher.set(CONNECTION_COUNT_KEY, 0)
  }

  app.io.on('connection', async (io: any) => {
    console.log('Client connected')

    await publisher.incr(CONNECTION_COUNT_KEY)

    io.on('disconnect', async () => {
      console.log('Client disconnected')

      await publisher.decr(CONNECTION_COUNT_KEY)
    })
  })

  app.get('/healthcheck', () => {
    return {
      status: 'ok',
      port: PORT,
    }
  })
  return app
}

async function main() {
  const app = await buildServer()

  try {
    await app.listen({
      port: PORT,
      host: HOST,
    })
    console.log(`Server started at http://${HOST}:${PORT}`)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
