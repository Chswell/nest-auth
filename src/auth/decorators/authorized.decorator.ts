import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { User } from '@prisma/__generated__'
import type { Request } from 'express'

export const Authorized = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<Request>()
		const user: User = request.user as User

		return data ? user[data] : user
	}
)
