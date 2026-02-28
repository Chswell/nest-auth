import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { ShiftHandoversService } from './shift-handovers.service'
import { ShiftHandoversController } from './shift-handovers.controller'

@Module({
	imports: [PrismaModule],
	controllers: [ShiftHandoversController],
	providers: [ShiftHandoversService]
})
export class ShiftHandoversModule {}

