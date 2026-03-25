import type { Account, User } from '@prisma/__generated__'

import type { PublicUser } from '@/user/user-public.types'

type AccountLike = Account | PublicUser['accounts'][number]

export function toPublicUser(
	user:
		| PublicUser
		| (Omit<User, 'password' | 'accounts'> & {
				password?: string
				accounts?: AccountLike[]
		  })
): PublicUser {
	if (!('password' in user) || user.password === undefined) {
		return user as PublicUser
	}

	const {
		password: _p,
		accounts,
		...rest
	} = user as User & {
		accounts?: AccountLike[]
	}
	const safeAccounts =
		accounts?.map(a => {
			const { accessToken, refreshToken, ...account } = a as Account
			return account
		}) ?? []
	return { ...rest, accounts: safeAccounts } as PublicUser
}
