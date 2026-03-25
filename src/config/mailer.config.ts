import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export const getMailerConfig = (
	configService: ConfigService
): MailerOptions => {
	const smtpHost = configService.getOrThrow<string>('MAIL_HOST')
	const smtpPort = configService.getOrThrow<string>('MAIL_PORT')
	const smtpUser = configService.getOrThrow<string>('MAIL_LOGIN')
	const smtpPass = configService.getOrThrow<string>('MAIL_PASSWORD')
	const appName = configService.getOrThrow<string>('APPLICATION_NAME')
	const fromEmail =
		configService.get<string>('MAIL_FROM') ?? `no-reply@${appName}.ru`

	return {
		transport: {
			host: smtpHost,
			port: Number(smtpPort),
			secure: Number(smtpPort) === 465,
			auth: {
				user: smtpUser,
				pass: smtpPass
			}
		},
		defaults: {
			from: fromEmail
		}
	}
}
