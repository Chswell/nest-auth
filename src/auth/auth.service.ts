import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod } from '@prisma/__generated__'
import { verify } from 'argon2'
import { type Request, type Response } from 'express'

import { parseEnvBool } from '@/libs/common/utils/parse-env-bool.util'

import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { EmailConfirmationService } from '@/auth/email-confirmation/email-confirmation.service'
import { ProviderService } from '@/auth/provider/provider.service'
import { TwoFactorAuthService } from '@/auth/two-factor-auth/two-factor-auth.service'
import { PrismaService } from '@/prisma/prisma.service'
import { toPublicUser } from '@/user/to-public-user.util'
import type { PublicUser } from '@/user/user-public.types'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly providerService: ProviderService,
		private readonly emailConfirmationService: EmailConfirmationService,
		private readonly twoFactorAuthService: TwoFactorAuthService
	) {}

	async register(req: Request, dto: RegisterDto) {
		const isExists = await this.userService.existsByEmail(dto.email)

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

		await this.emailConfirmationService.sendVerificationToken(newUser.email)

		return {
			message:
				'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адрес.'
		}
	}

	async login(req: Request, dto: LoginDto) {
		const user = await this.userService.findByEmailForAuth(dto.email)

		if (!user || !user.password) {
			throw new NotFoundException('Пользователь не найден.')
		}

		const isValidPassword = await verify(user.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException(
				'Неверный пароль. Пожалуйста, попробуйте ещё раз или восстановите пароль.'
			)
		}

		if (!user.isVerified) {
			await this.emailConfirmationService.sendVerificationToken(user.email)
			throw new UnauthorizedException(
				'Email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адрес.'
			)
		}

		if (user.isTwoFactorEnabled) {
			if (!dto.code) {
				await this.twoFactorAuthService.sendTwoFactorToken(user.email)

				return {
					message:
						'Проверьте вашу почту. Требуется код двухфакторной аутентификации.'
				}
			}

			await this.twoFactorAuthService.validateTwoFactorToken(
				user.email,
				dto.code
			)
		}

		return this.saveSession(req, user)
	}

	async extractProfileFromCode(req: Request, provider: string, code: string) {
		const providerInstance = this.providerService.findByService(provider)
		const profile = await providerInstance?.findUserByCode(code)

		if (!profile) {
			throw new NotFoundException('Профиль не был найден')
		}

		const account = await this.prismaService.account.findFirst({
			where: {
				id: profile.id,
				provider: profile.provider
			}
		})

		const user = account?.userId
			? await this.userService.findById(account.userId)
			: null

		if (user) {
			return this.saveSession(req, user)
		}

		const createdUser = await this.userService.create({
			email: profile?.email,
			password: '',
			displayName: profile?.name,
			picture: profile?.picture,
			method: AuthMethod[profile.provider.toUpperCase()] as AuthMethod,
			isVerified: true
		})

		if (!createdUser) {
			throw new InternalServerErrorException(
				'Не удалось создать пользователя через OAuth.'
			)
		}

		if (!account) {
			await this.prismaService.account.create({
				data: {
					userId: createdUser.id,
					type: 'oauth',
					provider: profile.provider,
					accessToken: profile.access_token,
					refreshToken: profile.refresh_token,
					expiresAt: profile.expires_at ?? 0
				}
			})
		}

		return this.saveSession(req, createdUser)
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

	saveSession(
		req: Request,
		user: Parameters<typeof toPublicUser>[0]
	): Promise<{ user: PublicUser }> {
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

				resolve({ user: toPublicUser(user) })
			})
		})
	}
}
