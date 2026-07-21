import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 1. Maintain the prisma client reference
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })

// 2. Add this named alias export so your API routes don't crash
export const db = prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
