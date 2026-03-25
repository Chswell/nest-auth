import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import type { Request } from 'express'

import { ProviderService } from '@/auth/provider/provider.service'
import { providerNotFoundMessage } from '@/config/error-messages.config'

@Injectable()
export class AuthProviderGuard implements CanActivate {
	constructor(private readonly providerService: ProviderService) {}

	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>()

		const providerParam = request.params.provider
		const provider = Array.isArray(providerParam)
			? providerParam[0]
			: providerParam

		const providerInstance = this.providerService.findByService(provider)

		if (!providerInstance) {
			throw new NotFoundException(providerNotFoundMessage(provider))
		}

		return true
	}
}
