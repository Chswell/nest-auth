import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res
} from '@nestjs/common'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { type Request } from 'express'
import { type Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(req, res)
	}
}
