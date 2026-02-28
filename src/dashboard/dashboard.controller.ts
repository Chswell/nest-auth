import { Controller, Get, Query } from '@nestjs/common'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('workers')
	getWorkers(@Query('date') date: string) {
		return this.dashboardService.getWorkersForDate(date)
	}

	@Get('gone-stats')
	getGoneStats(@Query('date') date: string) {
		return this.dashboardService.getGoneStatsForDate(date)
	}
}

