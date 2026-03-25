import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator'

export class LoginDto {
	@ApiProperty({
		example: 'mail@example.com',
		description: 'Email'
	})
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен' })
	email: string

	@ApiProperty({
		example: 'strongPassword123',
		description: 'Пароль для аккаунта'
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен' })
	@MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
	password: string

	@ApiProperty({
		example: '123456',
		description: 'Код для двухфакторной аутентификации '
	})
	@IsOptional()
	@IsString()
	code: string
}
