import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { GoneService } from './gone.service'
import { GoneController } from './gone.controller'

@Module({
	imports: [PrismaModule],
	controllers: [GoneController],
	providers: [GoneService]
})
export class GoneModule {}

