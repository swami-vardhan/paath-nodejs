import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Prisma 7 automatically inherits settings from your configurations, 
    // but enforcing it explicitly ensures serverless routing stability:
    datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
