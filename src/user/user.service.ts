import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { UserRole } from '@prisma/__generated__'

interface BulkEmployeeInput {
	employees: {
		name: string
		login: string
		password: string
		telegram?: string
	}[]
	storeId?: string
	newStoreName?: string
	schedulePattern?: '2/2' | '5/2'
	startDate?: string
	shiftTemplate?: string
	isNightWorker?: boolean
}

interface UpdateEmployeeDto {
	email?: string
	name?: string
}

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(params: { role?: UserRole; storeId?: string }) {
		const { role, storeId } = params
		return this.prisma.user.findMany({
			where: {
				...(role ? { role } : {}),
				...(storeId ? { storeId } : {})
			}
		})
	}

	async findOne(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})

		if (!user) {
			throw new NotFoundException('Сотрудник не найден')
		}

		return user
	}

	async bulkCreate(payload: BulkEmployeeInput) {
		let storeId = payload.storeId ?? null

		if (!storeId && payload.newStoreName) {
			const store = await this.prisma.store.create({
				data: {
					name: payload.newStoreName,
					address: payload.newStoreName
				}
			})
			storeId = store.id
		}

		const created: any[] = []

		for (const e of payload.employees) {
			const user = await this.prisma.user.create({
				data: {
					email: e.login,
					name: e.name,
					role: UserRole.worker,
					telegram: e.telegram,
					storeId: storeId ?? undefined,
					schedulePattern: payload.schedulePattern,
					scheduleStartDate: payload.startDate
						? new Date(payload.startDate)
						: undefined,
					shiftTemplate: payload.shiftTemplate,
					isNightWorker: payload.isNightWorker ?? undefined
				}
			})
			created.push(user)
		}

		return created
	}

	async update(id: string, dto: UpdateEmployeeDto) {
		try {
			return await this.prisma.user.update({
				where: { id },
				data: {
					...(dto.email ? { email: dto.email } : {}),
					...(dto.name ? { name: dto.name } : {})
				}
			})
		} catch {
			throw new NotFoundException('Сотрудник не найден')
		}
	}

	async remove(id: string) {
		await this.prisma.user.delete({
			where: { id }
		})
	}
}
