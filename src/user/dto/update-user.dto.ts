import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDto {
	@ApiProperty({
		example: 'Иван',
		description: 'Имя пользователя'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string

	@ApiProperty({
		example: 'mail@example.com',
		description: 'Email'
	})
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен' })
	email: string

	@ApiProperty({
		example: true,
		description: 'Включение/отключение двухфакторной аутентификации'
	})
	@IsBoolean({
		message: 'Поле isTwoFactorEnabled должно быть булевым значением.'
	})
	isTwoFactorEnabled: boolean
}
