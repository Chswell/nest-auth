import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import type { Request } from 'express'

import type { PublicUser } from '@/user/user-public.types'

export const Authorized = createParamDecorator(
	(data: keyof PublicUser | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<Request>()
		const user = request.user as PublicUser

		return data ? user[data] : user
	}
)
