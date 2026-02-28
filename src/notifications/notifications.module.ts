import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { AuthModule } from '@/auth/auth.module'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [NotificationsController],
	providers: [NotificationsService]
})
export class NotificationsModule {}

