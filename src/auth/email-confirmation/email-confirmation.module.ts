import { Module, forwardRef } from '@nestjs/common'

import { MailModule } from '@/libs/mail/mail.module'
import { MailService } from '@/libs/mail/mail.service'

import { EmailConfirmationController } from './email-confirmation.controller'
import { EmailConfirmationService } from './email-confirmation.service'
import { AuthModule } from '@/auth/auth.module'
import { UserService } from '@/user/user.service'

@Module({
	imports: [MailModule, forwardRef(() => AuthModule)],
	controllers: [EmailConfirmationController],
	providers: [EmailConfirmationService, UserService, MailService],
	exports: [EmailConfirmationService]
})
export class EmailConfirmationModule {}
