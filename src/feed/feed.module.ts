import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { FeedService } from './feed.service'
import { FeedController } from './feed.controller'

@Module({
	imports: [PrismaModule],
	controllers: [FeedController],
	providers: [FeedService]
})
export class FeedModule {}

