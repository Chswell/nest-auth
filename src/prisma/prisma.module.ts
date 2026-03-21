import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// eslint-disable-next-line prettier/prettier
@Global()
@Module({
  providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
