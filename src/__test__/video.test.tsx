import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoGalleryPage from '../app/video/page';
import { useSession } from 'next-auth/react';
import { prismaMock } from '../../prisma.singelton';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: { src: string; alt: string; width: number; height: number; className?: string }) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the global fetch API
global.fetch = jest.fn();

const mockVideos = [
  { id: '1', title: 'Перше відео', thumbnail: '/thumb1.jpg', user: { name: 'Автор 1' }, createdAt: '2023-01-01T10:00:00.000Z', _count: { likes: 5 } },
  { id: '2', title: 'Друге відео', thumbnail: null, user: { name: 'Автор 2' }, createdAt: '2023-01-05T12:00:00.000Z', _count: { likes: 10 } },
  { id: '3', title: 'Третє відео', thumbnail: '/thumb3.jpg', user: { name: 'Адмін' }, createdAt: '2022-12-20T08:00:00.000Z', _count: { likes: 2 } },
];

describe('VideoGalleryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockVideos,
    });
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Promise(() => {})); // Never resolves
    render(<VideoGalleryPage />);
    expect(screen.getByText('🎬 Усі відео')).toBeInTheDocument(); // Header should still render
  });

  it('fetches and displays videos on mount', async () => {
    render(<VideoGalleryPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/video');
    });    await waitFor(() => {
      expect(screen.getByText('Перше відео')).toBeInTheDocument();
      expect(screen.getByText('Друге відео')).toBeInTheDocument();
      expect(screen.getByText('Третє відео')).toBeInTheDocument();
      expect(screen.getByText('👤 Автор 1')).toBeInTheDocument();
      expect(screen.getByText('👤 Автор 2')).toBeInTheDocument();
      expect(screen.getByText('👤 Адмін')).toBeInTheDocument();
      expect(screen.getByAltText('Перше відео')).toBeInTheDocument();
      expect(screen.getByText('Немає зображення')).toBeInTheDocument();
      expect(screen.getByAltText('Третє відео')).toBeInTheDocument();
      expect(screen.getByText('01.01.2023')).toBeInTheDocument();
      expect(screen.getByText('05.01.2023')).toBeInTheDocument();
      expect(screen.getByText('20.12.2022')).toBeInTheDocument();
    });
  });

  it('displays "Нічого не знайдено." if no videos are fetched', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    render(<VideoGalleryPage />);
    await waitFor(() => {
      expect(screen.getByText('Нічого не знайдено.')).toBeInTheDocument();
    });
  });

  it('filters videos based on search input', async () => {
    render(<VideoGalleryPage />);

    const searchInput = screen.getByPlaceholderText('🔍 Пошук по назві...');
    fireEvent.change(searchInput, { target: { value: 'друге' } });

    await waitFor(() => {
      expect(screen.queryByText('Перше відео')).toBeNull();
      expect(screen.getByText('Друге відео')).toBeInTheDocument();
      expect(screen.queryByText('Третє відео')).toBeNull();
    });
  });
  it('sorts videos by date (newest first)', async () => {
    render(<VideoGalleryPage />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'date-desc' } });

    await waitFor(() => {
      const videoTitles = screen.getAllByText(/^(Перше відео|Друге відео|Третє відео)$/).map((el) => el.textContent);
      expect(videoTitles).toEqual(['Друге відео', 'Перше відео', 'Третє відео']);
    });
  });
  it('sorts videos by date (oldest first)', async () => {
    render(<VideoGalleryPage />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'date-asc' } });

    await waitFor(() => {
      const videoTitles = screen.getAllByText(/^(Перше відео|Друге відео|Третє відео)$/).map((el) => el.textContent);
      expect(videoTitles).toEqual(['Третє відео', 'Перше відео', 'Друге відео']);
    });
  });
  it('sorts videos alphabetically (A-Я)', async () => {
    render(<VideoGalleryPage />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'az' } });

    await waitFor(() => {
      const videoTitles = screen.getAllByText(/^(Перше відео|Друге відео|Третє відео)$/).map((el) => el.textContent);
      expect(videoTitles).toEqual(['Друге відео', 'Перше відео', 'Третє відео']); // Assuming localeCompare sorts this way
    });
  });
  it('sorts videos alphabetically (Я-A)', async () => {
    render(<VideoGalleryPage />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'za' } });

    await waitFor(() => {
      const videoTitles = screen.getAllByText(/^(Перше відео|Друге відео|Третє відео)$/).map((el) => el.textContent);
      expect(videoTitles).toEqual(['Третє відео', 'Перше відео', 'Друге відео']); // Assuming localeCompare sorts this way
    });
  });

  it('renders admin button for admin users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'Admin' } },
      status: 'authenticated',
    });
    render(<VideoGalleryPage />);
    await waitFor(() => {
      expect(screen.getByText('Адмін')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Адмін' })).toHaveAttribute('href', '/admin');
    });

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'administrator' } },
      status: 'authenticated',
    });
    render(<VideoGalleryPage />);
    await waitFor(() => {
      expect(screen.getByText('Адмін')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Адмін' })).toHaveAttribute('href', '/admin');
    });
  });

  it('does not render admin button for non-admin users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'User' } },
      status: 'authenticated',
    });
    render(<VideoGalleryPage />);
    await waitFor(() => {
      expect(screen.queryByText('Адмін')).toBeNull();
    });
  });

  it('handles fetch error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(<VideoGalleryPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка завантаження відео:', new Error('Failed to fetch'));
      expect(screen.getByText('🎬 Усі відео')).toBeInTheDocument(); // Ensure the page doesn't completely break
    });

    consoleErrorSpy.mockRestore();
  });
});