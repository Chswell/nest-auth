import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import type { SentMessageInfo } from 'nodemailer'

import { ConfirmationTemplate } from '@/libs/mail/templates/confirmation.template'
import { ResetPasswordTemplate } from '@/libs/mail/templates/reset-password.template'
import { TwoFactorAuthTemplate } from '@/libs/mail/templates/two-factor-auth.template'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendConfirmationMail(
		email: string,
		token: string
	): Promise<SentMessageInfo> {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(ConfirmationTemplate({ domain, token }))

		return this.sendMail(email, 'Подтверждение почты', html)
	}

	async sendPasswordResetEmail(
		email: string,
		token: string
	): Promise<SentMessageInfo> {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(ResetPasswordTemplate({ domain, token }))

		return this.sendMail(email, 'Сброс пароля', html)
	}

	async sendTwoFactorTokenEmail(
		email: string,
		token: string
	): Promise<SentMessageInfo> {
		const html = await render(TwoFactorAuthTemplate({ token }))

		return this.sendMail(email, 'Подтверждение входа', html)
	}

	private sendMail(
		email: string,
		subject: string,
		html: string
	): Promise<SentMessageInfo> {
		return this.mailerService.sendMail({ to: email, subject, html })
	}
}
