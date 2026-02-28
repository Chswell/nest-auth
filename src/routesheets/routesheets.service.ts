import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { RouteSheetTimeSlotId } from '@prisma/__generated__'

interface CreateRouteSheetInput {
	storeId: string
	date: string
}

interface SaveRouteSheetRowsInput {
	id: string
	rows: {
		id: string
		slotId: RouteSheetTimeSlotId
		newOrder: boolean
		otherTime: boolean
		otherTimeValue?: string
		timeNote: boolean
		timeNoteValue?: string
		courier: string
		orderNumber: string
		deliveryAddress: string
		customerName: string
		customerPhone: string
		recipientName: string
		recipientPhone: string
		details: string
		paid: boolean
		fromSite: boolean
		amount: number | null
		deliveryStepNotified: boolean
		ready: boolean
		delivered: boolean
	}[]
}

@Injectable()
export class RouteSheetsService {
	constructor(private readonly prisma: PrismaService) {}

	private mapSheet(sheet: any) {
		return {
			id: sheet.id,
			storeId: sheet.storeId,
			storeName: sheet.storeName ?? undefined,
			storeAddress: sheet.storeAddress ?? undefined,
			date: sheet.date.toISOString().slice(0, 10),
			createdAt: sheet.createdAt.toISOString(),
			rows: sheet.rows.map((r: any) => ({
				id: r.id,
				slotId: r.slotId,
				newOrder: r.newOrder,
				otherTime: r.otherTime,
				otherTimeValue: r.otherTimeValue ?? undefined,
				timeNote: r.timeNote,
				timeNoteValue: r.timeNoteValue ?? undefined,
				courier: r.courier,
				orderNumber: r.orderNumber,
				deliveryAddress: r.deliveryAddress,
				customerName: r.customerName,
				customerPhone: r.customerPhone,
				recipientName: r.recipientName,
				recipientPhone: r.recipientPhone,
				details: r.details,
				paid: r.paid,
				fromSite: r.fromSite,
				amount: r.amount,
				deliveryStepNotified: r.deliveryStepNotified,
				ready: r.ready,
				delivered: r.delivered
			}))
		}
	}

	async list(date: string) {
		const from = new Date(date)
		const to = new Date(from)
		to.setDate(to.getDate() + 1)

		const sheets = await this.prisma.routeSheet.findMany({
			where: {
				date: {
					gte: from,
					lt: to
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return sheets.map(s => ({
			id: s.id,
			storeId: s.storeId,
			storeName: s.storeName ?? undefined,
			storeAddress: s.storeAddress ?? undefined,
			date: s.date.toISOString().slice(0, 10),
			createdAt: s.createdAt.toISOString()
		}))
	}

	async getOne(id: string) {
		const sheet = await this.prisma.routeSheet.findUnique({
			where: { id },
			include: { rows: true }
		})

		if (!sheet) {
			return null
		}

		return this.mapSheet(sheet)
	}

	async create(input: CreateRouteSheetInput) {
		const from = new Date(input.date)
		const to = new Date(from)
		to.setDate(to.getDate() + 1)

		let sheet = await this.prisma.routeSheet.findFirst({
			where: {
				storeId: input.storeId,
				date: {
					gte: from,
					lt: to
				}
			},
			include: { rows: true }
		})

		if (!sheet) {
			const store = await this.prisma.store.findUnique({
				where: { id: input.storeId }
			})

			sheet = await this.prisma.routeSheet.create({
				data: {
					storeId: input.storeId,
					date: from,
					storeName: store?.name,
					storeAddress: store?.address
				},
				include: { rows: true }
			})
		}

		return this.mapSheet(sheet)
	}

	async saveRows(input: SaveRouteSheetRowsInput) {
		const sheet = await this.prisma.routeSheet.findUnique({
			where: { id: input.id }
		})

		if (!sheet) {
			throw new NotFoundException('Маршрутный лист не найден')
		}

		await this.prisma.routeSheetRow.deleteMany({
			where: { routeSheetId: input.id }
		})

		if (input.rows.length > 0) {
			await this.prisma.routeSheetRow.createMany({
				data: input.rows.map(r => ({
					routeSheetId: input.id,
					slotId: r.slotId,
					newOrder: r.newOrder,
					otherTime: r.otherTime,
					otherTimeValue: r.otherTimeValue,
					timeNote: r.timeNote,
					timeNoteValue: r.timeNoteValue,
					courier: r.courier,
					orderNumber: r.orderNumber,
					deliveryAddress: r.deliveryAddress,
					customerName: r.customerName,
					customerPhone: r.customerPhone,
					recipientName: r.recipientName,
					recipientPhone: r.recipientPhone,
					details: r.details,
					paid: r.paid,
					fromSite: r.fromSite,
					amount: r.amount ?? undefined,
					deliveryStepNotified: r.deliveryStepNotified,
					ready: r.ready,
					delivered: r.delivered
				}))
			})
		}

		const updated = await this.prisma.routeSheet.findUnique({
			where: { id: input.id },
			include: { rows: true }
		})

		if (!updated) {
			throw new NotFoundException('Маршрутный лист не найден после сохранения')
		}

		return this.mapSheet(updated)
	}
}

