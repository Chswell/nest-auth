import { DynamicModule, Module } from '@nestjs/common'

import {
	ProviderOptionsSymbol,
	TypeAsyncOptions,
	type TypeOptions
} from '@/auth/provider/provider.constants'
import { ProviderService } from '@/auth/provider/provider.service'

@Module({})
export class ProviderModule {
	static register(options: TypeOptions): DynamicModule {
		return {
			module: ProviderModule,
			providers: [
				{
					useValue: options.services,
					provide: ProviderOptionsSymbol
				},
				ProviderService
			],
			exports: [ProviderService]
		}
	}

	static registerAsync(options: TypeAsyncOptions): DynamicModule {
		return {
			module: ProviderModule,
			imports: options.imports,
			providers: [
				{
					useFactory: options.useFactory,
					provide: ProviderOptionsSymbol,
					inject: options.inject
				},
				ProviderService
			],
			exports: [ProviderService]
		}
	}
}
