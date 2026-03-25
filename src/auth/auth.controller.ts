import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	Req,
	Res,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { type Request } from 'express'
import { type Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { AuthGuard } from '@/auth/guards/auth.guard'
import { AuthProviderGuard } from '@/auth/guards/provider.guard'
import { ProviderService } from '@/auth/provider/provider.service'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
		private readonly providerService: ProviderService
	) {}

	@Recaptcha()
	@Post('register')
	@HttpCode(HttpStatus.OK)
	async register(@Req() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto)
	}

	@Recaptcha()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Req() req: Request, @Body() dto: LoginDto) {
		return this.authService.login(req, dto)
	}

	@Get('/oauth/callback/:provider')
	@UseGuards(AuthProviderGuard)
	async callback(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Query('code') code: string,
		@Param('provider') provider: string
	) {
		if (!code) {
			throw new BadRequestException('Не был предоставлен код авторизации.')
		}
		await this.authService.extractProfileFromCode(req, provider, code)

		return res.redirect(
			`${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`
		)
	}

	@UseGuards(AuthProviderGuard)
	@Get('/oauth/connect/:provider')
	connect(@Param('provider') provider: string) {
		const providerInstance = this.providerService.findByService(provider)
		return {
			url: providerInstance?.getAuthUrl()
		}
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(req, res)
	}
}
