import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { MailService } from './mail.service'
import { getMailerConfig } from '@/config/mailer.config'

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getMailerConfig,
			inject: [ConfigService]
		})
	],
	providers: [MailService]
})
export class MailModule {}
