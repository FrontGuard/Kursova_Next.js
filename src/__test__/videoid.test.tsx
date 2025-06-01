import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPage from '../app/video/[id]/page';
import { prisma } from '../lib/prisma';

// Mock Prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    video: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock RecordViewClient and LikeButton and CommentsSection
jest.mock('../../../components/RecordViewClient', () => ({
  __esModule: true,
  default: ({ videoId }: { videoId: string }) => <div data-testid={`record-view-${videoId}`}>RecordViewClient</div>,
}));

jest.mock('../../../components/LikeButton', () => ({
  __esModule: true,
  default: ({ videoId, initialCount }: { videoId: string; initialCount: number }) => (
    <div data-testid={`like-button-${videoId}`}>LikeButton ({initialCount})</div>
  ),
}));

jest.mock('../../../components/CommentsSection', () => ({
  __esModule: true,
  default: ({ videoId }: { videoId: string }) => <div data-testid={`comments-${videoId}`}>CommentsSection</div>,
}));

const mockVideo = {
  id: 'test-id',
  title: 'Тестове відео',
  description: 'Опис тестового відео',
  url: '/test.mp4',
  thumbnail: '/thumb.jpg',
  createdAt: new Date('2023-01-01T10:00:00.000Z'),
  user: { name: 'Тестовий Автор', id: 'author-id' },
  _count: { views: 100, likes: 50, comments: 20 },
};

describe('VideoPage', () => {
  beforeEach(() => {
    (prisma.video.findUnique as jest.Mock).mockResolvedValue(mockVideo);
  });

  it('renders video details correctly when video data is fetched', async () => {
    render(<VideoPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(prisma.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
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
      });
    });

    expect(screen.getByText('Тестове відео')).toBeInTheDocument();
    expect(screen.getByText('Додано: 01.01.2023, 10:00:00 | Автор: Тестовий Автор')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Тестовий Автор' })).toHaveAttribute('href', '/channel/author-id');
    expect(screen.getByRole('video')).toHaveAttribute('src', '/test.mp4');
    expect(screen.getByRole('video')).toHaveAttribute('poster', '/thumb.jpg');
    expect(screen.getByText('Опис тестового відео')).toBeInTheDocument();
    expect(screen.getByText('👁 100 переглядів')).toBeInTheDocument();
    expect(screen.getByTestId('record-view-test-id')).toBeInTheDocument();
    expect(screen.getByTestId('like-button-test-id')).toHaveTextContent('LikeButton (50)');
    expect(screen.getByText('💬 20 коментарів')).toBeInTheDocument();
    expect(screen.getByTestId('comments-test-id')).toBeInTheDocument();
  });

  it('renders video details correctly when thumbnail is null', async () => {
    (prisma.video.findUnique as jest.Mock).mockResolvedValue({ ...mockVideo, thumbnail: null });
    render(<VideoPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByRole('video')).not.toHaveAttribute('poster');
    });
  });

  it('renders video details correctly when description is null', async () => {
    (prisma.video.findUnique as jest.Mock).mockResolvedValue({ ...mockVideo, description: null });
    render(<VideoPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.queryByText('Опис тестового відео')).toBeNull();
    });
  });

  it('renders "Відео не знайдено" when video data is not found', async () => {
    (prisma.video.findUnique as jest.Mock).mockResolvedValue(null);
    render(<VideoPage params={{ id: 'non-existent-id' }} />);

    await waitFor(() => {
      expect(prisma.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
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
      });
    });

    expect(screen.getByText('Відео не знайдено')).toBeInTheDocument();
  });

  it('renders date in local string format', async () => {
    render(<VideoPage params={{ id: 'test-id' }} />);
    await waitFor(() => {
      expect(screen.getByText(`Додано: ${mockVideo.createdAt.toLocaleString()} | Автор:`)).toBeInTheDocument();
    });
  });
});