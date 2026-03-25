import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'
import { Recaptcha } from '@nestlab/google-recaptcha'

import { PasswordRecoveryService } from './password-recovery.service'
import { NewPasswordDto } from '@/auth/password-recovery/dto/new-password.dto'
import { ResetPasswordDto } from '@/auth/password-recovery/dto/reset-password.dto'

@Controller('auth/password-recovery')
export class PasswordRecoveryController {
	constructor(
		private readonly passwordRecoveryService: PasswordRecoveryService
	) {}

	@Recaptcha()
	@Post('reset')
	@HttpCode(HttpStatus.OK)
	async resetPassword(@Body() dto: ResetPasswordDto) {
		return this.passwordRecoveryService.resetPassword(dto)
	}

	@Recaptcha()
	@Post('new/:token')
	@HttpCode(HttpStatus.OK)
	async newPassword(
		@Body() dto: NewPasswordDto,
		@Param('token') token: string
	) {
		return this.passwordRecoveryService.newPassword(dto, token)
	}
}
