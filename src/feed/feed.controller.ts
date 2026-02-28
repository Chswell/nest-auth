import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { FeedService } from './feed.service'
import { PrismaService } from '@/prisma/prisma.service'

class CreatePostDto {
	title!: string
	content!: string
}

@Controller('feed')
export class FeedController {
	constructor(
		private readonly feedService: FeedService,
		private readonly prisma: PrismaService
	) {}

	@Get('posts')
	getPosts() {
		return this.feedService.list()
	}

	@Post('posts')
	async createPost(@Body() body: CreatePostDto) {
		// Для простоты берём первого пользователя как автора.
		const author =
			(await this.prisma.user.findFirst()) ??
			(await this.prisma.user.create({
				data: {
					email: 'system@example.com',
					name: 'System',
					role: 'superadmin'
				}
			}))

		return this.feedService.create({
			title: body.title,
			content: body.content,
			authorId: author.id
		})
	}

	@Delete('posts/:id')
	async deletePost(@Param('id') id: string) {
		await this.feedService.remove(id)
	}
}

