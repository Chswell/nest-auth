import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/__generated__'
import { PrismaPg } from '@prisma/adapter-pg'

import { ErrorMessages } from '@/config/error-messages.config'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(config: ConfigService) {
		const url = config.get<string>('POSTGRES_URI') ?? process.env.POSTGRES_URI
		if (!url) {
			throw new Error(ErrorMessages.prisma.databaseUrlMissing)
		}
		super({ adapter: new PrismaPg({ connectionString: url }) })
	}

	async onModuleInit(): Promise<void> {
		await this.$connect()
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect()
	}
}
