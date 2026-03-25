import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { TokenType } from '@prisma/__generated__'
import { hash } from 'argon2'
import { v4 as uuidv4 } from 'uuid'

import { MailService } from '@/libs/mail/mail.service'

import { NewPasswordDto } from '@/auth/password-recovery/dto/new-password.dto'
import { ResetPasswordDto } from '@/auth/password-recovery/dto/reset-password.dto'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

@Injectable()
export class PasswordRecoveryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly userService: UserService
	) {}

	async resetPassword(dto: ResetPasswordDto) {
		const existingUser = await this.userService.findByEmailPublic(dto.email)

		if (!existingUser) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
			)
		}

		const passwordResetToken = await this.generatePasswordResetToken(
			existingUser.email
		)

		await this.mailService.sendPasswordResetEmail(
			passwordResetToken.email,
			passwordResetToken.token
		)

		return true
	}

	async newPassword(dto: NewPasswordDto, token: string) {
		const existingToken = await this.prismaService.token.findFirst({
			where: { token, type: TokenType.PASSWORD_RESET }
		})

		if (!existingToken) {
			throw new NotFoundException(
				'Токен не найден. Пожалуйста, проверьте правильность введенного токена или запросите новый.'
			)
		}

		const isExpired = new Date(existingToken.expiresIn) < new Date()

		if (isExpired) {
			throw new BadRequestException(
				'Токен истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.'
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
				password: await hash(dto.password)
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_RESET
			}
		})

		return true
	}

	private async generatePasswordResetToken(email: string) {
		const token: string = uuidv4()
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				email,
				type: TokenType.PASSWORD_RESET
			}
		})

		if (existingToken) {
			await this.prismaService.token.delete({
				where: {
					id: existingToken.id,
					type: TokenType.PASSWORD_RESET
				}
			})
		}

		return this.prismaService.token.create({
			data: {
				email,
				token,
				expiresIn,
				type: TokenType.PASSWORD_RESET
			}
		})
	}
}
