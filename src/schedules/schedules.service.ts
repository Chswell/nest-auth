import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
	ScheduleApprovalStatus,
	ScheduleStatus
} from '@prisma/__generated__'

interface UpdateScheduleInput {
	employeeId: string
	month: string
	days: {
		date: string
		value: string
	}[]
}

@Injectable()
export class SchedulesService {
	constructor(private readonly prisma: PrismaService) {}

	async getAll(month: string) {
		const schedules = await this.prisma.employeeSchedule.findMany({
			where: { month },
			include: {
				days: true
			}
		})

		return schedules.map(s => ({
			employeeId: s.employeeId,
			employeeName: s.employeeId,
			month: s.month,
			days: s.days.map(d => ({
				date: d.date.toISOString().slice(0, 10),
				value: d.value
			})),
			status: s.status as ScheduleStatus,
			storeId: s.storeId,
			storeName: s.storeName ?? undefined,
			storeAddress: s.storeAddress ?? undefined,
			editedBy: s.editedBy ?? undefined,
			editedAt: s.editedAt?.toISOString(),
			rejectionReason: s.rejectionReason ?? undefined,
			isNightWorker: s.isNightWorker ?? undefined,
			telegram: s.telegram ?? undefined
		}))
	}

	async getOne(employeeId: string, month: string) {
		const schedule = await this.prisma.employeeSchedule.findUnique({
			where: {
				employeeId_month: {
					employeeId,
					month
				}
			},
			include: {
				days: true
			}
		})

		if (!schedule) {
			return null
		}

		return {
			employeeId: schedule.employeeId,
			employeeName: schedule.employeeId,
			month: schedule.month,
			days: schedule.days.map(d => ({
				date: d.date.toISOString().slice(0, 10),
				value: d.value
			})),
			status: schedule.status as ScheduleStatus,
			storeId: schedule.storeId,
			storeName: schedule.storeName ?? undefined,
			storeAddress: schedule.storeAddress ?? undefined,
			editedBy: schedule.editedBy ?? undefined,
			editedAt: schedule.editedAt?.toISOString(),
			rejectionReason: schedule.rejectionReason ?? undefined,
			isNightWorker: schedule.isNightWorker ?? undefined,
			telegram: schedule.telegram ?? undefined
		}
	}

	async updateSchedule(input: UpdateScheduleInput) {
		const employee = await this.prisma.user.findUnique({
			where: { id: input.employeeId }
		})

		if (!employee) {
			throw new NotFoundException('Сотрудник не найден')
		}

		let storeName: string | null = null
		let storeAddress: string | null = null

		if (employee.storeId) {
			const store = await this.prisma.store.findUnique({
				where: { id: employee.storeId }
			})
			if (store) {
				storeName = store.name
				storeAddress = store.address
			}
		}

		const schedule = await this.prisma.employeeSchedule.upsert({
			where: {
				employeeId_month: {
					employeeId: input.employeeId,
					month: input.month
				}
			},
			create: {
				employeeId: input.employeeId,
				month: input.month,
				status: ScheduleStatus.draft,
				storeId: employee.storeId,
				storeName,
				storeAddress,
				isNightWorker: employee.isNightWorker ?? undefined,
				telegram: employee.telegram ?? undefined
			},
			update: {
				status: ScheduleStatus.draft,
				storeId: employee.storeId,
				storeName,
				storeAddress,
				editedAt: new Date(),
				isNightWorker: employee.isNightWorker ?? undefined,
				telegram: employee.telegram ?? undefined
			}
		})

		await this.prisma.scheduleDay.deleteMany({
			where: {
				scheduleId: schedule.id
			}
		})

		if (input.days.length > 0) {
			await this.prisma.scheduleDay.createMany({
				data: input.days.map(d => ({
					scheduleId: schedule.id,
					date: new Date(d.date),
					value: d.value
				}))
			})
		}

		const withDays = await this.prisma.employeeSchedule.findUnique({
			where: { id: schedule.id },
			include: { days: true }
		})

		if (!withDays) {
			throw new NotFoundException('График не найден после обновления')
		}

		return {
			employeeId: withDays.employeeId,
			employeeName: withDays.employeeId,
			month: withDays.month,
			days: withDays.days.map(d => ({
				date: d.date.toISOString().slice(0, 10),
				value: d.value
			})),
			status: withDays.status as ScheduleStatus,
			storeId: withDays.storeId,
			storeName: withDays.storeName ?? undefined,
			storeAddress: withDays.storeAddress ?? undefined,
			editedBy: withDays.editedBy ?? undefined,
			editedAt: withDays.editedAt?.toISOString(),
			rejectionReason: withDays.rejectionReason ?? undefined,
			isNightWorker: withDays.isNightWorker ?? undefined,
			telegram: withDays.telegram ?? undefined
		}
	}

	getApprovalRequests() {
		return this.prisma.scheduleApprovalRequest.findMany()
	}

	async approveRequest(id: string) {
		const existing = await this.prisma.scheduleApprovalRequest.findUnique({
			where: { id }
		})

		if (!existing) {
			return null
		}

		const updated = await this.prisma.scheduleApprovalRequest.update({
			where: { id },
			data: {
				status: ScheduleApprovalStatus.approved,
				rejectionReason: null
			}
		})

		await this.prisma.employeeSchedule.updateMany({
			where: {
				employeeId: existing.employeeId,
				month: existing.month
			},
			data: {
				status: ScheduleStatus.approved,
				rejectionReason: null
			}
		})

		return updated
	}

	async rejectRequest(id: string, reason?: string) {
		const existing = await this.prisma.scheduleApprovalRequest.findUnique({
			where: { id }
		})

		if (!existing) {
			return null
		}

		const updated = await this.prisma.scheduleApprovalRequest.update({
			where: { id },
			data: {
				status: ScheduleApprovalStatus.rejected,
				rejectionReason: reason ?? null
			}
		})

		await this.prisma.employeeSchedule.updateMany({
			where: {
				employeeId: existing.employeeId,
				month: existing.month
			},
			data: {
				status: ScheduleStatus.rejected,
				rejectionReason: reason ?? null
			}
		})

		return updated
	}
}

