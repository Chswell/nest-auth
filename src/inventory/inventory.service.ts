import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

interface SaveInventoryInput {
	inventoryId: string
	storeId: string
	rows: {
		id?: string
		flowerName: string
		pf: number
		showcase: number
		writeOff: number
		bouquets: number
	}[]
}

@Injectable()
export class InventoryService {
	constructor(private readonly prisma: PrismaService) {}

	async getFlowerNames() {
		const rows = await this.prisma.inventoryItem.findMany({
			distinct: ['flowerName'],
			select: { flowerName: true }
		})
		return rows.map(r => r.flowerName)
	}

	async listByStore(storeId: string) {
		const items = await this.prisma.inventory.findMany({
			where: { storeId },
			orderBy: { createdAt: 'desc' }
		})

		return items.map(i => ({
			id: i.id,
			storeId: i.storeId,
			createdAt: i.createdAt.toISOString()
		}))
	}

	async listAll() {
		const items = await this.prisma.inventory.findMany({
			orderBy: { createdAt: 'desc' }
		})

		return items.map(i => ({
			id: i.id,
			storeId: i.storeId,
			createdAt: i.createdAt.toISOString()
		}))
	}

	async getOne(inventoryId: string) {
		const inventory = await this.prisma.inventory.findUnique({
			where: { id: inventoryId },
			include: { rows: true }
		})

		if (!inventory) {
			return null
		}

		return {
			id: inventory.id,
			storeId: inventory.storeId,
			createdAt: inventory.createdAt.toISOString(),
			rows: inventory.rows
		}
	}

	async create(storeId: string) {
		const inventory = await this.prisma.inventory.create({
			data: {
				storeId
			}
		})

		return {
			id: inventory.id,
			storeId: inventory.storeId,
			createdAt: inventory.createdAt.toISOString(),
			rows: []
		}
	}

	async save(input: SaveInventoryInput) {
		const inventory = await this.prisma.inventory.findUnique({
			where: { id: input.inventoryId }
		})

		if (!inventory) {
			throw new NotFoundException('Инвентаризация не найдена')
		}

		await this.prisma.inventory.update({
			where: { id: input.inventoryId },
			data: {
				storeId: input.storeId
			}
		})

		await this.prisma.inventoryItem.deleteMany({
			where: {
				inventoryId: input.inventoryId
			}
		})

		if (input.rows.length > 0) {
			await this.prisma.inventoryItem.createMany({
				data: input.rows.map(r => ({
					inventoryId: input.inventoryId,
					storeId: input.storeId,
					flowerName: r.flowerName,
					pf: r.pf,
					showcase: r.showcase,
					writeOff: r.writeOff,
					bouquets: r.bouquets
				}))
			})
		}

		const updated = await this.prisma.inventory.findUnique({
			where: { id: input.inventoryId },
			include: { rows: true }
		})

		if (!updated) {
			throw new NotFoundException('Инвентаризация не найдена после сохранения')
		}

		return {
			id: updated.id,
			storeId: updated.storeId,
			createdAt: updated.createdAt.toISOString(),
			rows: updated.rows
		}
	}

	async remove(inventoryId: string) {
		try {
			const deleted = await this.prisma.inventory.delete({
				where: { id: inventoryId }
			})

			return {
				id: deleted.id,
				storeId: deleted.storeId,
				createdAt: deleted.createdAt.toISOString()
			}
		} catch {
			return null
		}
	}
}

