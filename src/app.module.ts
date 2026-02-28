import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IS_DEV_ENV } from '@/libs/common/utils/is-dev.util'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { StoreModule } from './store/store.module'
import { SchedulesModule } from './schedules/schedules.module'
import { InventoryModule } from './inventory/inventory.module'
import { GoneModule } from './gone/gone.module'
import { ShiftHandoversModule } from './shift-handovers/shift-handovers.module'
import { RouteSheetsModule } from './routesheets/routesheets.module'
import { FeedModule } from './feed/feed.module'
import { NotificationsModule } from './notifications/notifications.module'
import { DashboardModule } from './dashboard/dashboard.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		AuthModule,
		UserModule,
		StoreModule,
		SchedulesModule,
		InventoryModule,
		GoneModule,
		ShiftHandoversModule,
		RouteSheetsModule,
		FeedModule,
		NotificationsModule,
		DashboardModule
	]
})
export class AppModule {}
