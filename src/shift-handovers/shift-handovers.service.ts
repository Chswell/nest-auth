import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

interface CreateShiftHandoverInput {
	storeId: string
	date: string
	items: {
		text: string
	}[]
	createdBy: string
}

interface UpdateShiftItemsInput {
	id: string
	items: {
		id: string
		text: string
		done: boolean
		comment?: string
	}[]
}

@Injectable()
export class ShiftHandoversService {
	constructor(private readonly prisma: PrismaService) {}

	private mapHandover(h: any) {
		return {
			id: h.id,
			storeId: h.storeId,
			storeName: h.storeName ?? undefined,
			storeAddress: h.storeAddress ?? undefined,
			date: h.date.toISOString().slice(0, 10),
			createdBy: h.createdBy,
			createdAt: h.createdAt.toISOString(),
			assignedTo: h.assignedTo ?? undefined,
			assignedToName: h.assignedToName ?? undefined,
			items: h.items.map((i: any) => ({
				id: i.id,
				text: i.text,
				done: i.done,
				comment: i.comment ?? undefined
			}))
		}
	}

	async list(date: string, storeId?: string) {
		const from = new Date(date)
		const to = new Date(from)
		to.setDate(to.getDate() + 1)

		const list = await this.prisma.shiftHandover.findMany({
			where: {
				date: {
					gte: from,
					lt: to
				},
				...(storeId ? { storeId } : {})
			},
			include: {
				items: true
			}
		})

		return list.map(h => this.mapHandover(h))
	}

	async create(input: CreateShiftHandoverInput) {
		const date = new Date(input.date)

		const store = await this.prisma.store.findUnique({
			where: { id: input.storeId }
		})

		const created = await this.prisma.shiftHandover.create({
			data: {
				storeId: input.storeId,
				date,
				createdBy: input.createdBy,
				items: {
					create: input.items.map(i => ({
						text: i.text
					}))
				}
			},
			include: {
				items: true
			}
		})

		return this.mapHandover({ ...created, storeName: store?.name ?? null, storeAddress: store?.address ?? null })
	}

	async assign(id: string, userId: string, userName: string) {
		try {
			const updated = await this.prisma.shiftHandover.update({
				where: { id },
				data: {
					assignedTo: userId,
					assignedToName: userName
				},
				include: {
					items: true
				}
			})

			return this.mapHandover(updated)
		} catch {
			return null
		}
	}

	async updateItems(input: UpdateShiftItemsInput) {
		const handover = await this.prisma.shiftHandover.findUnique({
			where: { id: input.id }
		})

		if (!handover) {
			throw new NotFoundException('Передача смены не найдена')
		}

		await this.prisma.shiftHandoverItem.deleteMany({
			where: { handoverId: input.id }
		})

		await this.prisma.shiftHandoverItem.createMany({
			data: input.items.map(i => ({
				handoverId: input.id,
				text: i.text,
				done: i.done,
				comment: i.comment
			}))
		})

		const updated = await this.prisma.shiftHandover.findUnique({
			where: { id: input.id },
			include: { items: true }
		})

		if (!updated) {
			throw new NotFoundException('Передача смены не найдена после обновления')
		}

		return this.mapHandover(updated)
	}
}

