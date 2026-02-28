import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

// eslint-disable-next-line prettier/prettier
@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			include: {
				accounts: true
			}
		})

		if (!user) {
			throw new UnauthorizedException(`Пользователь не найден. Пожалуйста, проверьте данные`)
		}

		return user
	}

	async findByEmail(email: string) {
		return this.prismaService.user.findUnique({
			where: {
				email
			},
			include: {
				accounts: true
			}
		})
	}

	async create() {}


}
