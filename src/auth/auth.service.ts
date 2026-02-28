import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { randomUUID } from 'node:crypto'

interface LoginDto {
	email: string
	password: string
}

export interface AuthUser {
	id: string
	email: string
	name: string
	role: string
	storeId?: string | null
	telegram?: string | null
}

@Injectable()
export class AuthService {
	private readonly tokens = new Map<string, AuthUser>()

	constructor(private readonly prisma: PrismaService) {}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email }
		})

		if (!user) {
			throw new UnauthorizedException('Неверный email или пароль')
		}

		// Пароль пока не проверяем, так как в схеме нет хеша пароля.

		const authUser: AuthUser = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			storeId: user.storeId,
			telegram: user.telegram
		}

		const token = randomUUID()
		this.tokens.set(token, authUser)

		return {
			token,
			user: authUser
		}
	}

	getUserByToken(token?: string | null): AuthUser | null {
		if (!token) return null
		return this.tokens.get(token) ?? null
	}

	logout(token?: string | null): void {
		if (!token) return
		this.tokens.delete(token)
	}
}
