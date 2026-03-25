import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class NewPasswordDto {
	@IsString({ message: 'Пароль должен быть строкой.' })
	@MinLength(8, { message: 'Пароль должен содержать не менее 6 символов.' })
	@IsNotEmpty({ message: 'Поле новый пароль не может быть пустым.' })
	password: string
}
