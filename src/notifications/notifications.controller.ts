import { Controller, Get, Headers, Param, Post } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { AuthService } from '@/auth/auth.service'

@Controller('notifications')
export class NotificationsController {
	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly authService: AuthService
	) {}

	@Get()
	async list(@Headers('authorization') authorization?: string) {
		const token = extractBearerToken(authorization)
		const user = this.authService.getUserByToken(token)
		if (!user) return []
		return this.notificationsService.listForUser(user.id)
	}

	@Post(':id/read')
	async markOne(@Param('id') id: string) {
		await this.notificationsService.markOneRead(id)
	}

	@Post('read-all')
	async markAll(@Headers('authorization') authorization?: string) {
		const token = extractBearerToken(authorization)
		const user = this.authService.getUserByToken(token)
		if (!user) return
		await this.notificationsService.markAllRead(user.id)
	}
}

function extractBearerToken(header?: string): string | null {
	if (!header) return null
	const [scheme, token] = header.split(' ')
	if (scheme?.toLowerCase() !== 'bearer' || !token) return null
	return token
}

