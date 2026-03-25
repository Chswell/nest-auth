import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthMethod } from '@prisma/__generated__'
import { hash } from 'argon2'

import { ErrorMessages } from '@/config/error-messages.config'
import { PrismaService } from '@/prisma/prisma.service'
import { UpdateUserDto } from '@/user/dto/update-user.dto'
import {
	PUBLIC_ACCOUNT_SELECT,
	PUBLIC_USER_READ
} from '@/user/user-public.constants'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			...PUBLIC_USER_READ
		})

		if (!user) {
			throw new UnauthorizedException(ErrorMessages.user.notFoundCheckData)
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

	async update(userId: string, dto: UpdateUserDto) {
		const user = await this.findById(userId)

		return this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email: dto.email,
				displayName: dto.name,
				isTwoFactorEnabled: dto.isTwoFactorEnabled
			},
			...PUBLIC_USER_READ
		})
	}
}
