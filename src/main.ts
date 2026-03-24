import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
// import session from 'express-session'
import ms, { StringValue } from 'ms'
import { createClient } from 'redis'

import { parseEnvBool } from '@/libs/common/utils/parse-env-bool.util'
import { AppModule } from './app.module'

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-assignment
const session = require('express-session')

function getRedisUrl(config: ConfigService): string {
	const uri = config.get<string>('REDIS_URI') ?? process.env.REDIS_URI
	if (uri && !uri.includes('${')) {
		return uri
	}
	const host =
		config.get<string>('REDIS_HOST') ?? process.env.REDIS_HOST ?? 'localhost'
	const port =
		config.get<string>('REDIS_PORT') ?? process.env.REDIS_PORT ?? '6379'
	const user = config.get<string>('REDIS_USER') ?? process.env.REDIS_USER
	const password =
		config.get<string>('REDIS_PASSWORD') ?? process.env.REDIS_PASSWORD
	const auth =
		user && password
			? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
			: ''
	return `redis://${auth}${host}:${port}`
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)
	const redisClient = createClient({
		url: getRedisUrl(config)
	})
	await redisClient.connect()

	const sessionDomain = config.getOrThrow<string>('SESSION_DOMAIN').trim()

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: true,
			saveUninitialized: false,
			cookie: {
				...(sessionDomain ? { domain: sessionDomain } : {}),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseEnvBool(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
				secure: parseEnvBool(config.getOrThrow<string>('SESSION_SECURE')),
				sameSite: 'lax'
			},
			store: new RedisStore({
				client: redisClient,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposeHeaders: ['set-cookie']
	})

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
