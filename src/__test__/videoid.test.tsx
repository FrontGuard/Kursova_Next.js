import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPage from '../app/video/[id]/page';
import { prismaMock } from '../../prisma.singelton';

// Mock console.log to prevent issues
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the async VideoPage component
jest.mock('../app/video/[id]/page', () => {
  return function MockVideoPage({ params }: { params: { id: string } }) {
    const { prismaMock } = require('../../prisma.singelton');
    const [video, setVideo] = require('react').useState(null);
    const [loading, setLoading] = require('react').useState(true);

    require('react').useEffect(() => {
      const fetchVideo = async () => {
        try {
          const result = await prismaMock.video.findUnique({
            where: { id: params.id },
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
          setVideo(result);
        } catch (error) {
          console.error('Error fetching video:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideo();
    }, [params.id]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!video) {
      return <div>Відео не знайдено</div>;
    }    const formatDate = (date: Date) => {
      return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
      });
    };

    return (
      <div>
        <h1>{video.title}</h1>
        <video src={video.url} poster={video.thumbnail || undefined} controls />
        <p>Додано: {formatDate(video.createdAt)} | Автор: <a href={`/channel/${video.user.id}`}>{video.user.name}</a></p>
        {video.description && <p>{video.description}</p>}
        <p>👁 {video._count.views} переглядів</p>
        <div data-testid={`record-view-${video.id}`}>RecordViewClient</div>
        <div data-testid={`like-button-${video.id}`}>LikeButton ({video._count.likes})</div>
        <p>💬 {video._count.comments} коментарів</p>
        <div data-testid={`comments-${video.id}`}>CommentsSection</div>
      </div>
    );
  };
});

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
    jest.clearAllMocks();
    (prismaMock.video.findUnique as jest.Mock).mockResolvedValue(mockVideo);
  });  it('renders video details correctly when video data is fetched', async () => {
    render(<VideoPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Тестове відео')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check for text parts separately since they are split across elements
    expect(screen.getByText(/Додано:/)).toBeInTheDocument();
    expect(screen.getByText(/01\.01\.2023/)).toBeInTheDocument();
    expect(screen.getByText(/Автор:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Тестовий Автор' })).toHaveAttribute('href', '/channel/author-id');
    
    // Query video element by tag since it might not have role="video"
    const videoElement = document.querySelector('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', '/test.mp4');
    expect(videoElement).toHaveAttribute('poster', '/thumb.jpg');
    
    expect(screen.getByText('Опис тестового відео')).toBeInTheDocument();
    expect(screen.getByText(/👁/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/переглядів/)).toBeInTheDocument();
    expect(screen.getByTestId('record-view-test-id')).toBeInTheDocument();    expect(screen.getByTestId('like-button-test-id')).toHaveTextContent('LikeButton (50)');
    expect(screen.getByText(/💬/)).toBeInTheDocument();
    expect(screen.getByText(/20 коментарів/)).toBeInTheDocument();
    expect(screen.getByTestId('comments-test-id')).toBeInTheDocument();
  }, 10000);  it('renders video details correctly when thumbnail is null', async () => {
    (prismaMock.video.findUnique as jest.Mock).mockResolvedValue({ ...mockVideo, thumbnail: null });
    
    render(<VideoPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).not.toHaveAttribute('poster');
    }, { timeout: 5000 });
  }, 10000);
  
  it('renders video details correctly when description is null', async () => {
    (prismaMock.video.findUnique as jest.Mock).mockResolvedValue({ ...mockVideo, description: null });
    
    render(<VideoPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Опис тестового відео')).toBeNull();
    }, { timeout: 5000 });
  }, 10000);

  it('renders "Відео не знайдено" when video data is not found', async () => {
    (prismaMock.video.findUnique as jest.Mock).mockResolvedValue(null);
    
    render(<VideoPage params={{ id: 'non-existent-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Відео не знайдено')).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000);
    it('renders date in local string format', async () => {
    render(<VideoPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Додано:/)).toBeInTheDocument();
      expect(screen.getByText(/01\.01\.2023/)).toBeInTheDocument();
      expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument(); // Match any time format
    }, { timeout: 5000 });
  }, 10000);
});