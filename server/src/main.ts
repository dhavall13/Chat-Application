import dotenv from 'dotenv'
import fastify from 'fastify'

dotenv.config()

const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL

// const CONNECTION_COUNT_KEY = "chat:connection-count";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";
// const NEW_MESSAGE_CHANNEL = "chat:new-message";

if (!UPSTASH_REDIS_REST_URL) {
  console.error('missing UPSTASH_REDIS_REST_URL')
  process.exit(1)
}

async function buildServer() {
  const app = fastify()
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
