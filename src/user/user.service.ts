import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { AuthMethod } from '@prisma/__generated__'
import { hash } from 'argon2'

import { PUBLIC_ACCOUNT_SELECT, PUBLIC_USER_READ } from '@/user/user-public.constants'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			...PUBLIC_USER_READ
		})

		if (!user) {
			throw new UnauthorizedException(
				`Пользователь не найден. Пожалуйста, проверьте данные`
			)
		}

		return user
	}

	async findByEmailPublic(email: string) {
		return this.prismaService.user.findUnique({
			where: { email },
			...PUBLIC_USER_READ
		})
	}

	async existsByEmail(email: string): Promise<boolean> {
		const row = await this.prismaService.user.findUnique({
			where: { email },
			select: { id: true }
		})
		return !!row
	}

	/** Только для проверки пароля при входе по email. */
	async findByEmailForAuth(email: string) {
		return this.prismaService.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				password: true,
				displayName: true,
				picture: true,
				role: true,
				isVerified: true,
				isTwoFactorEnabled: true,
				method: true,
				createdAt: true,
				updatedAt: true,
				accounts: {
					select: PUBLIC_ACCOUNT_SELECT
				}
			}
		})
	}

	async create(userPayload: {
		email: string
		password: string
		displayName: string
		picture: string
		method: AuthMethod
		isVerified: boolean
	}) {
		return this.prismaService.user.create({
			data: {
				...userPayload,
				password: userPayload.password ? await hash(userPayload.password) : ''
			},
			...PUBLIC_USER_READ
		})
	}
}
