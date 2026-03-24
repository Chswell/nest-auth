import { DocumentBuilder } from '@nestjs/swagger'

export function getSwaggerConfig() {
	return new DocumentBuilder().setTitle('Trava API').setVersion('1.0').build()
}
