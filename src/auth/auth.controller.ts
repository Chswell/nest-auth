import { Body, Controller, Get, Headers, HttpCode, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

class LoginRequestDto {
	email!: string
	password!: string
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(200)
	async login(@Body() body: LoginRequestDto) {
		return this.authService.login(body)
	}

	@Get('me')
	async me(@Headers('authorization') authorization?: string) {
		const token = extractBearerToken(authorization)
		return this.authService.getUserByToken(token)
	}

	@Post('logout')
	@HttpCode(204)
	async logout(@Headers('authorization') authorization?: string) {
		const token = extractBearerToken(authorization)
		this.authService.logout(token)
	}
}

function extractBearerToken(header?: string): string | null {
	if (!header) return null
	const [scheme, token] = header.split(' ')
	if (scheme?.toLowerCase() !== 'bearer' || !token) return null
	return token
}
