import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { SchedulesService } from './schedules.service'

class UpdateScheduleDto {
	days!: {
		date: string
		value: string
	}[]
}

class RejectScheduleDto {
	reason?: string
}

@Controller()
export class SchedulesController {
	constructor(private readonly schedulesService: SchedulesService) {}

	@Get('schedules')
	getAll(@Query('month') month: string) {
		return this.schedulesService.getAll(month)
	}

	@Get('schedules/:employeeId')
	getOne(
		@Param('employeeId') employeeId: string,
		@Query('month') month: string
	) {
		return this.schedulesService.getOne(employeeId, month)
	}

	@Put('schedules/:employeeId/:month')
	update(
		@Param('employeeId') employeeId: string,
		@Param('month') month: string,
		@Body() body: UpdateScheduleDto
	) {
		return this.schedulesService.updateSchedule({
			employeeId,
			month,
			days: body.days ?? []
		})
	}

	@Get('schedule-approval-requests')
	getApprovalRequests() {
		return this.schedulesService.getApprovalRequests()
	}

	@Post('schedule-approval-requests/:id/approve')
	approve(@Param('id') id: string) {
		return this.schedulesService.approveRequest(id)
	}

	@Post('schedule-approval-requests/:id/reject')
	reject(@Param('id') id: string, @Body() body: RejectScheduleDto) {
		return this.schedulesService.rejectRequest(id, body.reason)
	}
}

