import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/__generated__'
import type { Request } from 'express'

import { ROLES_KEY } from '@/auth/decorators/roles.decorator'
import { ErrorMessages } from '@/config/error-messages.config'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])
		const request = context.switchToHttp().getRequest<Request>()

		if (!roles) return true

		const user = request.user
		if (!user) {
			throw new UnauthorizedException(
				ErrorMessages.guards.authorizationRequired
			)
		}

		if (!roles.includes(user.role)) {
			throw new ForbiddenException(ErrorMessages.guards.forbiddenResource)
		}

		return true
	}
}
