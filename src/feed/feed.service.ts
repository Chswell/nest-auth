import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

interface CreatePostInput {
	title: string
	content: string
	authorId: string
}

@Injectable()
export class FeedService {
	constructor(private readonly prisma: PrismaService) {}

	async list() {
		const posts = await this.prisma.feedPost.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				author: true
			}
		})

		return posts.map(p => ({
			id: p.id,
			authorId: p.authorId,
			authorName: p.author.name,
			title: p.title,
			content: p.content,
			createdAt: p.createdAt.toISOString()
		}))
	}

	async create(input: CreatePostInput) {
		const author = await this.prisma.user.findUnique({
			where: { id: input.authorId }
		})

		if (!author) {
			throw new Error('Автор не найден')
		}

		const created = await this.prisma.feedPost.create({
			data: {
				authorId: input.authorId,
				title: input.title,
				content: input.content
			},
			include: {
				author: true
			}
		})

		return {
			id: created.id,
			authorId: created.authorId,
			authorName: created.author.name,
			title: created.title,
			content: created.content,
			createdAt: created.createdAt.toISOString()
		}
	}

	async remove(id: string) {
		await this.prisma.feedPost.delete({
			where: { id }
		})
	}
}

