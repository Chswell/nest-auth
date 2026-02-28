import { Body, Controller, Get, Put, Query } from '@nestjs/common'
import { GoneService } from './gone.service'

class SaveGoneMonthlyDto {
	storeId!: string
	month!: string
	days!: {
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
	}[]
}

@Controller('gone')
export class GoneController {
	constructor(private readonly goneService: GoneService) {}

	@Get('monthly')
	getMonthly(
		@Query('storeId') storeId: string,
		@Query('month') month: string
	) {
		return this.goneService.getMonthly(storeId, month)
	}

	@Put('monthly')
	saveMonthly(@Body() body: SaveGoneMonthlyDto) {
		return this.goneService.saveMonthly({
			storeId: body.storeId,
			month: body.month,
			days: body.days ?? []
		})
	}
}

