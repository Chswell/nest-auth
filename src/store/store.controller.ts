import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { StoreService } from './store.service'

class CreateStoreDto {
	name!: string
	address!: string
}

@Controller('stores')
export class StoreController {
	constructor(private readonly storeService: StoreService) {}

	@Get()
	findAll() {
		return this.storeService.findAll()
	}

	@Post()
	create(@Body() body: CreateStoreDto) {
		return this.storeService.create(body)
	}

	@Get(':storeId/workers')
	getWorkers(@Param('storeId') storeId: string) {
		return this.storeService.getWorkers(storeId)
	}
}

