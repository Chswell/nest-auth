import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getWorkersForDate(date: string) {
		const from = new Date(date)
		const to = new Date(from)
		to.setDate(to.getDate() + 1)

		const schedules = await this.prisma.employeeSchedule.findMany({
			where: {
				days: {
					some: {
						date: {
							gte: from,
							lt: to
						},
						value: {
							not: ''
						}
					}
				}
			},
			include: {
				employee: true
			}
		})

		const storeIds = Array.from(
			new Set(
				schedules
					.map(s => s.storeId ?? s.employee.storeId)
					.filter((id): id is string => Boolean(id))
			)
		)

		const stores = await this.prisma.store.findMany({
			where: {
				id: {
					in: storeIds
				}
			}
		})

		const byStore: Record<
			string,
			{
				storeId: string
				storeName?: string
				storeAddress?: string
				workers: { id: string; name: string; telegram?: string }[]
			}
		> = {}

		for (const s of schedules) {
			const storeId = (s.storeId ?? s.employee.storeId) as string | undefined
			if (!storeId) continue
			if (!byStore[storeId]) {
				const store = stores.find(st => st.id === storeId)
				byStore[storeId] = {
					storeId,
					storeName: store?.name,
					storeAddress: store?.address,
					workers: []
				}
			}
			byStore[storeId].workers.push({
				id: s.employee.id,
				name: s.employee.name,
				telegram: s.employee.telegram ?? undefined
			})
		}

		return Object.values(byStore)
	}

	async getGoneStatsForDate(date: string) {
		const from = new Date(date)
		const to = new Date(from)
		to.setDate(to.getDate() + 1)

		const days = await this.prisma.goneDayRow.findMany({
			where: {
				date: {
					gte: from,
					lt: to
				}
			},
			include: {
				items: true,
				monthlyList: true
			}
		})

		const storeIds = Array.from(
			new Set(days.map(d => d.monthlyList.storeId))
		)

		const stores = await this.prisma.store.findMany({
			where: {
				id: {
					in: storeIds
				}
			}
		})

		const byStore: Record<
			string,
			{
				storeId: string
				storeName?: string
				storeAddress?: string
				total: number
				byReason: {
					price: number
					tour: number
					nonbuyer: number
					notfound: number
					other: number
				}
			}
		> = {}

		for (const d of days) {
			const storeId = d.monthlyList.storeId
			if (!byStore[storeId]) {
				const store = stores.find(st => st.id === storeId)
				byStore[storeId] = {
					storeId,
					storeName: store?.name,
					storeAddress: store?.address,
					total: 0,
					byReason: {
						price: 0,
						tour: 0,
						nonbuyer: 0,
						notfound: 0,
						other: 0
					}
				}
			}

			for (const item of d.items) {
				byStore[storeId].total += 1
				const reason = (item.reason ?? 'other') as keyof typeof byStore[typeof storeId]['byReason']
				byStore[storeId].byReason[reason] += 1
			}
		}

		return Object.values(byStore)
	}
}

