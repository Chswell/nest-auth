import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from './app.module'
import { PrismaService } from './prisma/prisma.service'

describe('App e2e', () => {
	let app: INestApplication

	const prismaMock = {
		user: {
			findUnique: jest.fn()
		},
		store: {
			findMany: jest.fn()
		}
	} as any

	beforeAll(async () => {
		prismaMock.user.findUnique.mockResolvedValue({
			id: 'user-1',
			email: 'superadmin@example.com',
			name: 'Super Admin',
			role: 'superadmin',
			storeId: null,
			telegram: null
		})

		prismaMock.store.findMany.mockResolvedValue([
			{ id: 'store-1', name: 'Main Store', address: 'Main Address' }
		])

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideProvider(PrismaService)
			.useValue(prismaMock)
			.compile()

		app = moduleFixture.createNestApplication()
		app.setGlobalPrefix('api')
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /api/auth/login and GET /api/auth/me', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/login')
			.send({
				email: 'superadmin@example.com',
				password: 'password'
			})
			.expect(200)

		expect(res.body).toHaveProperty('token')
		expect(res.body).toHaveProperty('user')
		expect(res.body.user.email).toBe('superadmin@example.com')

		const token = res.body.token as string

		const meRes = await request(app.getHttpServer())
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)

		expect(meRes.body).not.toBeNull()
		expect(meRes.body.email).toBe('superadmin@example.com')
	})

	it('GET /api/stores', async () => {
		const res = await request(app.getHttpServer())
			.get('/api/stores')
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
		expect(res.body[0]).toHaveProperty('id', 'store-1')
	})
})

