import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class NotificationsService {
	constructor(private readonly prisma: PrismaService) {}

	async listForUser(userId: string) {
		const items = await this.prisma.notification.findMany({
			where: {
				OR: [{ recipientId: userId }, { recipientId: null }]
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return items.map(n => ({
			id: n.id,
			type: n.type,
			title: n.title,
			message: n.message,
			createdAt: n.createdAt.toISOString(),
			read: n.read,
			recipientId: n.recipientId ?? undefined,
			meta: n.meta ?? undefined
		}))
	}

	async markOneRead(id: string) {
		await this.prisma.notification.update({
			where: { id },
			data: {
				read: true
			}
		})
	}

	async markAllRead(userId: string) {
		await this.prisma.notification.updateMany({
			where: {
				OR: [{ recipientId: userId }, { recipientId: null }]
			},
			data: {
				read: true
			}
		})
	}
}

