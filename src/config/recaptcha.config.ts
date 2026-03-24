import { ConfigService } from '@nestjs/config'
import { GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha'
import { type Request } from 'express'

import { isDev } from '@/libs/common/utils/is-dev.util'

function getRecaptchaTokenFromRequest(req: Request): string {
	const token = req.headers['recaptcha']
	if (typeof token === 'string') return token
	if (Array.isArray(token)) return token[0] ?? ''
	return ''
}

export const getRecaptchaConfig = (
	configService: ConfigService
): GoogleRecaptchaModuleOptions => ({
	secretKey: configService.getOrThrow<string>('GOOGLE_RECAPTCHA_SECRET_KEY'),
	response: (req: Request) => getRecaptchaTokenFromRequest(req),
	skipIf: isDev(configService)
})
