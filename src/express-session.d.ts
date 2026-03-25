import 'express-session'

import type { PublicUser } from '@/user/user-public.types'

declare module 'express-session' {
	interface SessionData {
		userId?: string
	}
}

declare global {
	namespace Express {
		interface Request {
			user?: PublicUser
		}
	}
}

export {}
