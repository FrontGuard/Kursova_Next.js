// scripts/createAdmin.ts
import { prisma } from '../src/lib/prisma'
import bcryptjs from 'bcryptjs'

async function main() {
const hashed = await bcryptjs.hash('admin123', 10)

await prisma.user.create({
data: {
name: 'Адмін',
email: 'admin@example.com',
password: hashed,
role: 'ADMIN',
},
})

console.log('Адміністратор створений')
}

main()
.catch((e) => {
console.error(e)
process.exit(1)
})
.finally(() => prisma.$disconnect())