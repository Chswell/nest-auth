import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated__'
import { verify } from 'argon2'
import { type Request, type Response } from 'express'

import { parseEnvBool } from '@/libs/common/utils/parse-env-bool.util'

import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}

	async register(req: Request, dto: RegisterDto) {
		const isExists = await this.userService.findByEmail(dto.email)

		if (isExists) {
			throw new ConflictException(
				'Ошибка. Пользователь с таким email уже существует.'
			)
		}

		const newUser = await this.userService.create({
			email: dto.email,
			password: dto.password,
			displayName: dto.name,
			picture: '',
			method: AuthMethod.CREDENTIALS,
			isVerified: false
		})

		return this.saveSession(req, newUser)
	}

	async login(req: Request, dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email)

		if (!user || !user.password) {
			throw new NotFoundException('Пользователь не найден.')
		}

		const isValidPassword = await verify(user.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException(
				'Неверный пароль. Пожалуйста, попробуйте ещё раз или восстановите пароль.'
			)
		}

		return this.saveSession(req, user)
	}

	async logout(req: Request, res: Response): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось завершить сессию. Возможно возникла проблема с сервером или сессия уже завершена.'
						)
					)
				}
				const name = this.configService.getOrThrow<string>('SESSION_NAME')
				const domain = this.configService
					.getOrThrow<string>('SESSION_DOMAIN')
					.trim()
				res.clearCookie(name, {
					path: '/',
					...(domain ? { domain } : {}),
					httpOnly: parseEnvBool(
						this.configService.getOrThrow<string>('SESSION_HTTP_ONLY')
					),
					secure: parseEnvBool(
						this.configService.getOrThrow<string>('SESSION_SECURE')
					),
					sameSite: 'lax'
				})
				resolve()
			})
		})
	}

	private saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию. Проверьте правильно ли настроены параметры сессии.'
						)
					)
				}

				resolve({ user })
			})
		})
	}
}
