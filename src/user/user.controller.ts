import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UserRole } from '@prisma/__generated__'
import { UserService } from './user.service'

class BulkEmployeesDto {
	employees!: {
		name: string
		login: string
		password: string
		telegram?: string
	}[]
	storeId?: string
	newStoreName?: string
	schedulePattern?: '2/2' | '5/2'
	startDate?: string
	shiftTemplate?: string
	isNightWorker?: boolean
}

class UpdateEmployeeDto {
	email?: string
	name?: string
}

@Controller('employees')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findAll(
		@Query('role') role?: UserRole,
		@Query('storeId') storeId?: string
	) {
		return this.userService.findAll({
			role,
			storeId
		})
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.findOne(id)
	}

	@Post('bulk')
	createBulk(@Body() body: BulkEmployeesDto) {
		return this.userService.bulkCreate(body)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
		return this.userService.update(id, body)
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		await this.userService.remove(id)
	}
}
