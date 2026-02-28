import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	Query
} from '@nestjs/common'
import { ShiftHandoversService } from './shift-handovers.service'

class CreateShiftHandoverDto {
	storeId!: string
	date!: string
	items!: { text: string }[]
}

class AssignShiftDto {
	userId?: string
	userName?: string
}

class UpdateShiftItemsDto {
	items!: {
		id: string
		text: string
		done: boolean
		comment?: string
	}[]
}

@Controller('shift-handovers')
export class ShiftHandoversController {
	constructor(
		private readonly shiftHandoversService: ShiftHandoversService
	) {}

	@Get()
	list(
		@Query('date') date: string,
		@Query('storeId') storeId?: string
	) {
		return this.shiftHandoversService.list(date, storeId)
	}

	@Post()
	create(@Body() body: CreateShiftHandoverDto) {
		return this.shiftHandoversService.create({
			storeId: body.storeId,
			date: body.date,
			items: body.items ?? [],
			createdBy: 'system'
		})
	}

	@Post(':id/assign')
	assign(@Param('id') id: string, @Body() body: AssignShiftDto) {
		const userId = body.userId ?? 'system'
		const userName = body.userName ?? 'System'
		return this.shiftHandoversService.assign(id, userId, userName)
	}

	@Put(':id/items')
	updateItems(@Param('id') id: string, @Body() body: UpdateShiftItemsDto) {
		return this.shiftHandoversService.updateItems({
			id,
			items: body.items ?? []
		})
	}
}

