import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

interface GoneDayRowInput {
	date: string
	items: {
		id: string
		time: string
		floristId?: string
		gender: 'male' | 'female' | 'unknown'
		compliment: boolean
		reason: 'price' | 'tour' | 'nonbuyer' | 'notfound' | 'other' | null
		comment?: string
		returned: boolean
	}[]
}

interface SaveMonthlyInput {
	storeId: string
	month: string
	days: GoneDayRowInput[]
}

@Injectable()
export class GoneService {
	constructor(private readonly prisma: PrismaService) {}

	private mapMonthly(list: any) {
		return {
			id: list.id,
			storeId: list.storeId,
			month: list.month,
			createdAt: list.createdAt.toISOString(),
			days: list.days.map((d: any) => ({
				date: d.date.toISOString().slice(0, 10),
				items: d.items.map((i: any) => ({
					id: i.id,
					time: i.time,
					floristId: i.floristId ?? undefined,
					gender: i.gender,
					compliment: i.compliment,
					reason: i.reason ?? null,
					comment: i.comment ?? undefined,
					returned: i.returned
				}))
			}))
		}
	}

	async getMonthly(storeId: string, month: string) {
		let list = await this.prisma.goneMonthlyList.findUnique({
			where: {
				storeId_month: {
					storeId,
					month
				}
			},
			include: {
				days: {
					include: {
						items: true
					}
				}
			}
		})

		if (!list) {
			list = await this.prisma.goneMonthlyList.create({
				data: {
					storeId,
					month
				},
				include: {
					days: {
						include: {
							items: true
						}
					}
				}
			})
		}

		return this.mapMonthly(list)
	}

	async saveMonthly(input: SaveMonthlyInput) {
		let list = await this.prisma.goneMonthlyList.findUnique({
			where: {
				storeId_month: {
					storeId: input.storeId,
					month: input.month
				}
			}
		})

		if (!list) {
			list = await this.prisma.goneMonthlyList.create({
				data: {
					storeId: input.storeId,
					month: input.month
				}
			})
		}

		await this.prisma.goneDayRow.deleteMany({
			where: {
				monthlyListId: list.id
			}
		})

		for (const day of input.days) {
			await this.prisma.goneDayRow.create({
				data: {
					monthlyListId: list.id,
					date: new Date(day.date),
					items: {
						create: day.items.map(i => ({
							time: i.time,
							floristId: i.floristId,
							gender: i.gender,
							compliment: i.compliment,
							reason: i.reason ?? undefined,
							comment: i.comment,
							returned: i.returned
						}))
					}
				}
			})
		}

		const updated = await this.prisma.goneMonthlyList.findUnique({
			where: { id: list.id },
			include: {
				days: {
					include: {
						items: true
					}
				}
			}
		})

		if (!updated) {
			return null
		}

		return this.mapMonthly(updated)
	}
}

