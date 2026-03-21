import { ConflictException, Injectable } from '@nestjs/common'
import { AuthMethod, User } from '@prisma/__generated__'
import { RegisterDto } from '@/auth/dto/register.dto'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	async register(dto: RegisterDto) {
		const isExists = await this.userService.findByEmail(dto.email)

		if (isExists) {
			throw new ConflictException('Ошибка. Пользователь с таким email уже существует.')
		}

		const newUser = await this.userService.create(
			{
				email: dto.email,
				password: dto.password,
				displayName: dto.name,
				picture: '',
				method: AuthMethod.CREDENTIALS,
				isVerified: false
			}
		)

		return this.saveSession(newUser)
	}

	async login(user: User) {}

	async logout(user: User) {}

	private saveSession(user: User) {
		console.log(user)
	}
}
