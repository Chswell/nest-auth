import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { RouteSheetsService } from './routesheets.service'
import { RouteSheetsController } from './routesheets.controller'

@Module({
	imports: [PrismaModule],
	controllers: [RouteSheetsController],
	providers: [RouteSheetsService]
})
export class RouteSheetsModule {}

