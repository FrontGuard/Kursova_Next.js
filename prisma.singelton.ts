import { PrismaClient } from '@prisma/client'

// Create a mock Prisma client
const createPrismaMock = () => ({
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
})

// Mock the prisma module
jest.mock('./src/lib/prisma', () => ({
  __esModule: true,
  prisma: createPrismaMock(),
}))

// Import the mocked prisma after setting up the mock
const { prisma } = require('./src/lib/prisma')

beforeEach(() => {
  jest.clearAllMocks()
})

// Export the mocked prisma instance
export const prismaMock = prisma as jest.Mocked<PrismaClient>

// Type definition for video with details
export type VideoWithDetails = {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail: string | null
  createdAt: Date
  user: {
    name: string
    id: string
  }
  _count: {
    views: number
    likes: number
    comments: number
  }
}

// Function to get video by ID with all necessary details
export async function getVideoById(videoId: string): Promise<VideoWithDetails | null> {
  return await prismaMock.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      thumbnail: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          id: true,
        },
      },
      _count: {
        select: {
          views: true,
          likes: true,
          comments: true,
        },
      },
    },
  })
}