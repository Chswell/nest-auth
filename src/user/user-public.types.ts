import type { Prisma } from '@prisma/__generated__'

export type PublicUser = Prisma.UserGetPayload<{
	omit: { password: true }
	include: {
		accounts: {
			select: {
				id: true
				type: true
				provider: true
				expiresAt: true
				createdAt: true
				updatedAt: true
				userId: true
			}
		}
	}
}>
