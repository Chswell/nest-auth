import { Body, Heading, Html, Link, Text } from '@react-email/components'
import * as React from 'react'

interface IResetPasswordTemplateProps {
	domain: string
	token: string
}

export function ResetPasswordTemplate({
	domain,
	token
}: IResetPasswordTemplateProps) {
	const confirmLink = `${domain}/auth/new-password?token=${token}`

	return (
		<Html>
			<Body>
				<Heading>Сброс пароля</Heading>
				<Text>
					Вы запросили сброс пароля. Пожалуйста перейдите по следующей ссылке,
					чтобы создать новый пароль:
				</Text>
				<Link href={confirmLink}>Сбросить пароль</Link>
				<Text>
					Эта ссылка действительна в течение 1 часа. Если вы не запрашивали
					подтверждение, просто проигнорируйте это сообщение.
				</Text>
				<Text>Спасибо за использование нашего сервиса!</Text>
			</Body>
		</Html>
	)
}
