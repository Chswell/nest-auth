export const PUBLIC_ACCOUNT_SELECT = {
	id: true,
	type: true,
	provider: true,
	expiresAt: true,
	createdAt: true,
	updatedAt: true,
	userId: true
} as const

export const PUBLIC_USER_READ = {
	omit: { password: true as const },
	include: {
		accounts: {
			select: PUBLIC_ACCOUNT_SELECT
		}
	}
} as const
