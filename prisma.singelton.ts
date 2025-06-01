
import { PrismaClient } from '@prisma/client'
import { prisma } from './src/lib/prisma'

// Mock the prisma client
jest.mock('./src/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    video: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    like: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    view: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

// Export the mocked prisma instance
export const prismaMock = prisma as jest.Mocked<PrismaClient>