/** Сообщения об ошибках для throw / HTTP-исключений */

export const ErrorMessages = {
	common: {
		userNotFoundByEmail:
			'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
	},
	auth: {
		userAlreadyExists: 'Ошибка. Пользователь с таким email уже существует.',
		userNotFound: 'Пользователь не найден.',
		invalidPassword:
			'Неверный пароль. Пожалуйста, попробуйте ещё раз или восстановите пароль.',
		emailNotVerified:
			'Email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адрес.',
		profileNotFound: 'Профиль не был найден',
		oauthUserCreateFailed: 'Не удалось создать пользователя через OAuth.',
		sessionDestroyFailed:
			'Не удалось завершить сессию. Возможно возникла проблема с сервером или сессия уже завершена.',
		sessionSaveFailed:
			'Не удалось сохранить сессию. Проверьте правильно ли настроены параметры сессии.'
	},
	user: {
		notFoundCheckData: 'Пользователь не найден. Пожалуйста, проверьте данные'
	},
	guards: {
		authorizationRequired: 'Требуется авторизация',
		forbiddenResource: 'У вас нет прав доступа к этому ресурсу'
	},
	oauth: {
		codeMissing: 'Не был предоставлен код авторизации.'
	},
	passwordRecovery: {
		tokenNotFound:
			'Токен не найден. Пожалуйста, проверьте правильность введенного токена или запросите новый.',
		tokenExpired:
			'Токен истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.'
	},
	twoFactor: {
		tokenNotFound:
			'Токен двухфакторной аутентификации не найден. Пожалуйста, убедитесь что вы запрашивали токен для данного адреса электронной почты.',
		invalidCode:
			'Неверный код. Пожалуйста, проверьте введенный код и попробуйте снова.',
		tokenExpired:
			'Срок действия токена двухфакторной аутентификации истек. Пожалуйста, запросите новый токен.'
	},
	emailConfirmation: {
		tokenNotFound:
			'Токен подтверждения не найден. Пожалуйста, убедитесь что у вас правильный токен.',
		tokenExpired:
			'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.'
	},
	prisma: {
		databaseUrlMissing: 'POSTGRES_URI or DATABASE_URL must be set'
	}
} as const

export function providerNotFoundMessage(provider: string): string {
	return `Провайдер ${provider} не найдет. Пожалуйста, проверьте правильность введенных данных.`
}

export function oauthTokenRequestFailedMessage(profileUrl: string): string {
	return `Не удалось получить пользователя с ${profileUrl}. Проверьте правильность токена.`
}

export function oauthNoTokensFromAccessMessage(accessUrl: string): string {
	return `Нет токенов с ${accessUrl}. Убедитесь, что код авторизации действителен.`
}

export function oauthUserProfileFailedMessage(profileUrl: string): string {
	return `Не удалось получить пользователя с ${profileUrl}. Проверьте правильность токена доступа.`
}
