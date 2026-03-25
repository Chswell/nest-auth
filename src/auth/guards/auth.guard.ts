import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import type { Request } from 'express'

import { ErrorMessages } from '@/config/error-messages.config'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()

		if (typeof request.session.userId === 'undefined') {
			throw new UnauthorizedException(
				ErrorMessages.guards.authorizationRequired
			)
		}

		request.user = await this.userService.findById(request.session.userId)

		return true
	}
}
