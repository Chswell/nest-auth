import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class StoreService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.store.findMany()
	}

	create(data: { name: string; address: string }) {
		return this.prisma.store.create({
			data
		})
	}

	getWorkers(storeId: string) {
		return this.prisma.user.findMany({
			where: {
				storeId,
				role: 'worker'
			}
		})
	}
}

