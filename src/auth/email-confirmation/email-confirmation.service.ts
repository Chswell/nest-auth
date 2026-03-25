import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	forwardRef
} from '@nestjs/common'
import { TokenType } from '@prisma/__generated__'
import { type Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

import { MailService } from '@/libs/mail/mail.service'

import { AuthService } from '@/auth/auth.service'
import { ConfirmationDto } from '@/auth/email-confirmation/dto/confirmation.dto'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

@Injectable()
export class EmailConfirmationService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly userService: UserService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService
	) {}

	async newVerification(req: Request, dto: ConfirmationDto) {
		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token: dto.token,
				type: TokenType.VERIFICATION
			}
		})

		if (!existingToken) {
			throw new NotFoundException(
				'Токен подтверждения не найден. Пожалуйста, убедитесь что у вас правильный токен.'
			)
		}

		const isExpired = new Date(existingToken.expiresIn) < new Date()

		if (isExpired) {
			throw new BadRequestException(
				'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.'
			)
		}

		const existingUser = await this.userService.findByEmailPublic(
			existingToken.email
		)

		if (!existingUser) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
			)
		}

		await this.prismaService.user.update({
			where: {
				id: existingUser.id
			},
			data: {
				isVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.VERIFICATION
			}
		})

		return this.authService.saveSession(req, existingUser)
	}

	async sendVerificationToken(email: string) {
		const verificationToken = await this.generateVerificationToken(email)

		await this.mailService.sendConfirmationMail(
			verificationToken.email,
			verificationToken.token
		)

		return true
	}

	private async generateVerificationToken(email: string) {
		const token: string = uuidv4()
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				email,
				type: TokenType.VERIFICATION
			}
		})

		if (existingToken) {
			await this.prismaService.token.delete({
				where: {
					id: existingToken.id,
					type: TokenType.VERIFICATION
				}
			})
		}

		return this.prismaService.token.create({
			data: {
				email,
				token,
				expiresIn,
				type: TokenType.VERIFICATION
			}
		})
	}
}
