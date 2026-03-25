import { Body, Heading, Html, Text } from '@react-email/components'
import * as React from 'react'

interface ITwoFactorAuthTemplateProps {
	token: string
}

export function TwoFactorAuthTemplate({ token }: ITwoFactorAuthTemplateProps) {
	return (
		<Html>
			<Body>
				<Heading>Двухфакторная аутентификация</Heading>
				<Text>
					Ваш код: <strong>{token}</strong>
				</Text>
				<Text>Введите этот код в приложении для входа.</Text>
				<Text>
					Если вы не запрашивали этот код, просто проигнорируйте это сообщение
				</Text>
			</Body>
		</Html>
	)
}
