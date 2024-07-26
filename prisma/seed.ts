import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.create({
    data: {
      email: 'example@gmail.com',
      password: '$2b$10$GO7C7pt6BTq51JgtKAJ4VeicmFzVLBNODC9U5WnGwWbi5vlIrMmK2',
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });