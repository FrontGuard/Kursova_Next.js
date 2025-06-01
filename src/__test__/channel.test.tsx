import { render, screen, waitFor, act } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import AuthorChannelPage from '../app/channel/[id]/page';
 import { useParams } from 'next/navigation';
 import { useRouter, NextRouter } from 'next/router';

 // Mock the useParams hook
 jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
 }));

 // Mock the useRouter hook
 jest.mock('next/router', () => ({
  useRouter: jest.fn(),
 }));

 // Mock the fetch API
 global.fetch = jest.fn();

 const mockVideos = [
  { id: '1', title: 'Відео 1', thumbnail: '/thumbnail1.jpg', createdAt: '2025-05-30T10:00:00.000Z' },
  { id: '2', title: 'Відео 2', thumbnail: null, createdAt: '2025-05-29T15:30:00.000Z' },
 ];

 describe('AuthorChannelPage', () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: 'test-channel-id' });
    (global.fetch as jest.Mock).mockClear();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() } as unknown as NextRouter);
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: [] }),
    });

    render(<AuthorChannelPage />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('fetches and displays author name and video count', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Тестовий автор')).toBeInTheDocument();
      expect(screen.getByText('Загальна кількість відео: 2')).toBeInTheDocument();
    });
  });

  it('displays "Автор ще не додав жодного відео." when there are no videos', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: [] }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Автор ще не додав жодного відео.')).toBeInTheDocument();
    });
  });

  it('renders the list of videos with thumbnails and titles', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Відео 1')).toBeInTheDocument();
      expect(screen.getByAltText('Відео 1')).toBeInTheDocument();
      expect(screen.getByText('Додано: 30.05.2025')).toBeInTheDocument();

      expect(screen.getByText('Відео 2')).toBeInTheDocument();
      expect(screen.getByText('Немає зображення')).toBeInTheDocument();
      expect(screen.getByText('Додано: 29.05.2025')).toBeInTheDocument();
    });
  });

  it('renders "Невідомий автор" if the author name is not provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Невідомий автор')).toBeInTheDocument();
    });
  });

  it('renders 0 as the video count if videos are not provided or not an array', async () => {
    // Test case 1: videos is undefined
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор' }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Загальна кількість відео: 0')).toBeInTheDocument();
    });

    // Test case 2: videos is 'not an array'
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: 'not an array' }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Загальна кількість відео: 0')).toBeInTheDocument();
    });
  });

  it('logs an error and displays no videos if the fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка завантаження каналу:', new Error('Fetch error'));
      expect(screen.getByText('Автор ще не додав жодного відео.')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders Link components with correct href for each video', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/video/1');
      expect(links[1]).toHaveAttribute('href', '/video/2');
    });
  });

  it('handles a response with null or undefined name', async () => {
    // Test case 1: name is null
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: null, videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Невідомий автор')).toBeInTheDocument();
      expect(screen.getByText('Загальна кількість відео: 2')).toBeInTheDocument();
    });

    // Test case 2: name is undefined
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: undefined, videos: mockVideos }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Невідомий автор')).toBeInTheDocument();
      expect(screen.getByText('Загальна кількість відео: 2')).toBeInTheDocument();
    });
  });

  it('handles a response with videos as null or undefined', async () => {
    // Test case 1: videos is null
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: null }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Тестовий автор')).toBeInTheDocument();
      expect(screen.getByText('Загальна кількість відео: 0')).toBeInTheDocument();
      expect(screen.getByText('Автор ще не додав жодного відео.')).toBeInTheDocument();
    });

    // Test case 2: videos is undefined
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ name: 'Тестовий автор', videos: undefined }),
    });

    await act(async () => {
      render(<AuthorChannelPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Канал: Тестовий автор')).toBeInTheDocument();
      expect(screen.getByText('Загальна кількість відео: 0')).toBeInTheDocument();
      expect(screen.getByText('Автор ще не додав жодного відео.')).toBeInTheDocument();
    });
  });
 });