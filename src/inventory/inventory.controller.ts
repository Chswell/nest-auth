import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { InventoryService } from './inventory.service'

class CreateInventoryDto {
	storeId!: string
}

class SaveInventoryDto {
	storeId!: string
	rows!: {
		id?: string
		flowerName: string
		pf: number
		showcase: number
		writeOff: number
		bouquets: number
	}[]
}

@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@Get('flower-names')
	getFlowerNames() {
		return this.inventoryService.getFlowerNames()
	}

	@Get()
	listByStore(@Query('storeId') storeId: string) {
		return this.inventoryService.listByStore(storeId)
	}

	@Get('all')
	listAll() {
		return this.inventoryService.listAll()
	}

	@Get(':inventoryId')
	getOne(@Param('inventoryId') inventoryId: string) {
		return this.inventoryService.getOne(inventoryId)
	}

	@Post()
	create(@Body() body: CreateInventoryDto) {
		return this.inventoryService.create(body.storeId)
	}

	@Put(':inventoryId')
	save(
		@Param('inventoryId') inventoryId: string,
		@Body() body: SaveInventoryDto
	) {
		return this.inventoryService.save({
			inventoryId,
			storeId: body.storeId,
			rows: body.rows ?? []
		})
	}

	@Delete(':inventoryId')
	remove(@Param('inventoryId') inventoryId: string) {
		return this.inventoryService.remove(inventoryId)
	}
}

