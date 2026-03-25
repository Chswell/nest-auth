import { Inject, Injectable } from '@nestjs/common'

import {
	ProviderOptionsSymbol,
	type TypeOptions
} from '@/auth/provider/provider.constants'
import { BaseOauthService } from '@/auth/provider/services/base-oauth.service'

@Injectable()
export class ProviderService {
	constructor(
		@Inject(ProviderOptionsSymbol) private readonly options: TypeOptions
	) {}

	onModuleInit() {
		for (const provider of this.options.services) {
			provider.baseUrl = this.options.baseUrl
		}
	}

	findByService(service: string): BaseOauthService | null {
		return this.options.services.find(s => s.name === service) ?? null
	}
}
