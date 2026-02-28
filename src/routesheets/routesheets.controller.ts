import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { RouteSheetTimeSlotId } from '@prisma/__generated__'
import { RouteSheetsService } from './routesheets.service'

class CreateRouteSheetDto {
	storeId!: string
	date!: string
}

class SaveRouteSheetRowsDto {
	rows!: {
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

@Controller('routesheets')
export class RouteSheetsController {
	constructor(private readonly routeSheetsService: RouteSheetsService) {}

	@Get()
	list(@Query('date') date: string) {
		return this.routeSheetsService.list(date)
	}

	@Get(':id')
	getOne(@Param('id') id: string) {
		return this.routeSheetsService.getOne(id)
	}

	@Post()
	create(@Body() body: CreateRouteSheetDto) {
		return this.routeSheetsService.create({
			storeId: body.storeId,
			date: body.date
		})
	}

	@Put(':id')
	saveRows(@Param('id') id: string, @Body() body: SaveRouteSheetRowsDto) {
		return this.routeSheetsService.saveRows({
			id,
			rows: body.rows ?? []
		})
	}
}

