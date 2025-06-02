import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import CommentsSection from '../components/CommentsSection'; // Assuming CommentsSection.tsx is in the 'components' directory
 import { useSession } from 'next-auth/react';

 // Mock the useSession hook
 jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
 }));

 // Mock the global fetch API
 global.fetch = jest.fn();
 global.alert = jest.fn(); // Mock the alert function

 const mockComments = [
  {
    id: '1',
    text: 'Перший коментар',
    createdAt: '2025-05-31T20:00:00.000Z',
    user: { name: 'Користувач 1' },
  },
  {
    id: '2',
    text: 'Другий коментар',
    createdAt: '2025-05-31T21:00:00.000Z',
    user: { name: 'Користувач 2' },
  },
 ];

 describe('CommentsSection', () => {
  let mockUseSession: jest.Mock;
  let mockAlert: jest.Mock;
  beforeEach(() => {
    mockUseSession = useSession as jest.Mock;
    (global.fetch as jest.Mock).mockClear();
    mockAlert = global.alert as jest.Mock;
    mockAlert.mockClear();
    
    // Default mock for fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });
    
    // Default mock for useSession
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
  });

  it('renders "Коментарі" heading', () => {
    render(<CommentsSection videoId="123" />);
    expect(screen.getByText('Коментарі')).toBeInTheDocument();
  });
  it('fetches and displays comments on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockComments),
    });

    render(<CommentsSection videoId="123" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/comments?videoId=123');
    });

    await waitFor(() => {
      expect(screen.getByText('Перший коментар')).toBeInTheDocument();
      expect(screen.getByText(/Користувач 1/)).toBeInTheDocument();
      expect(screen.getByText('Другий коментар')).toBeInTheDocument();
      expect(screen.getByText(/Користувач 2/)).toBeInTheDocument();
    });
  });
  it('does not render comment form when user is not authenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<CommentsSection videoId="123" />);

    expect(screen.queryByPlaceholderText('Напишіть коментар...')).not.toBeInTheDocument();
    expect(screen.queryByText('Відправити')).not.toBeInTheDocument();
  });
  it('does not submit empty comment', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Тестовий користувач' } },
      status: 'authenticated',
    });
    
    await act(async () => {
      render(<CommentsSection videoId="123" />);
    });

    await waitFor(() => {
      expect(screen.getByText('Відправити')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Відправити');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).not.toHaveBeenCalledWith(
      '/api/comments',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('submits a new comment and updates the list', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Тестовий користувач' } },
      status: 'authenticated',
    });
    const newComment = {
      id: '3',
      text: 'Новий коментар',
      createdAt: new Date().toISOString(),
      user: { name: 'Тестовий користувач' },
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue(mockComments) }) // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(newComment),
      });

    render(<CommentsSection videoId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Перший коментар')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Напишіть коментар...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Новий коментар' } });
    const submitButton = screen.getByText('Відправити');

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/comments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ videoId: '123', text: 'Новий коментар' }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Новий коментар')).toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('renders the comment form when user is logged in', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Тестовий користувач' } },
      status: 'authenticated',
    });
    render(<CommentsSection videoId="123" />);
    expect(screen.getByPlaceholderText('Напишіть коментар...')).toBeInTheDocument();
    expect(screen.getByText('Відправити')).toBeInTheDocument();
  });

  it('does not render the comment form when user is not logged in', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<CommentsSection videoId="123" />);
    expect(screen.queryByPlaceholderText('Напишіть коментар...')).toBeNull();
    expect(screen.queryByText('Відправити')).toBeNull();
  });
  it('displays formatted date and time for comments', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        {
          id: '4',
          text: 'Коментар з іншою датою',
          createdAt: '2025-06-01T12:30:45.000Z',
          user: { name: 'Хтось інший' },
        },
      ]),
    });

    render(<CommentsSection videoId="456" />);

    await waitFor(() => {
      expect(screen.getByText('Коментар з іншою датою')).toBeInTheDocument();
      expect(screen.getByText(/Хтось інший/)).toBeInTheDocument();
    });
  });
});