import { PrismaClient, UserRole } from './__generated__'

const prisma = new PrismaClient()

async function main() {
	const email = 'superadmin@example.com'

	const existing = await prisma.user.findUnique({
		where: { email }
	})

	if (!existing) {
		await prisma.user.create({
			data: {
				email,
				name: 'Super Admin',
				role: UserRole.superadmin
			}
		})
	}
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
