import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LikeButton from '../components/LikeButton';
import { useSession } from 'next-auth/react';
import { prismaMock } from '../../prisma.singelton';

// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the global fetch API
global.fetch = jest.fn();
global.alert = jest.fn(); // Mock the alert function

describe('LikeButton', () => {
  let mockUseSession: jest.Mock;
  let mockAlert: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession = useSession as jest.Mock;
    (global.fetch as jest.Mock).mockClear();
    mockAlert = global.alert as jest.Mock;
    mockAlert.mockClear();
  });

  it('renders the initial like count', () => {
    // Mock useSession to return null for this test
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    // Mock the initial fetch call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ liked: false }),
    });

    render(<LikeButton videoId="123" initialCount={10} />);
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });  it('fetches the initial like status on mount', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ liked: true }),
    });

    render(<LikeButton videoId="123" initialCount={5} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/likes/status?videoId=123');
    });

    // Wait for the state to update based on the fetch
    await waitFor(() => {
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-blue-600');
    });
  });

  it('displays gray thumbs up initially if not liked', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ liked: false }),
    });
    render(<LikeButton videoId="456" initialCount={2} />);
    await waitFor(() => {
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-gray-600');
    });
  });
  it('shows login alert if trying to like without session', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    // Mock the initial fetch call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ liked: false }),
    });
    
    render(<LikeButton videoId="789" initialCount={0} />);

    const likeButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(likeButton);
    });

    expect(mockAlert).toHaveBeenCalledWith('Увійдіть, щоб лайкати');
    expect(global.fetch).not.toHaveBeenCalledWith('/api/likes', expect.anything());
  });
  it('sends a POST request to /api/likes when liked and updates count and liked state', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ liked: false }) }) // Initial status
      .mockResolvedValueOnce({ ok: true }); // Like success

    render(<LikeButton videoId="abc" initialCount={3} />);
    
    // Wait for initial status to be fetched and button to be gray
    await waitFor(() => {
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-gray-600');
    });

    const likeButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(likeButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: 'abc' }),
    });
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-blue-600');
    });
  });
  it('sends a POST request to /api/likes to unlike and updates count and liked state', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ liked: true }) }) // Initial status
      .mockResolvedValueOnce({ ok: true }); // Unlike success
      
    render(<LikeButton videoId="def" initialCount={6} />);
    await waitFor(() => {
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-blue-600');
    });

    const likeButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(likeButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: 'def' }),
    });
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-gray-600');
    });
  });
  it('does not update count or liked state if like/unlike request fails', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ liked: false }) }) // Initial status
      .mockResolvedValueOnce({ ok: false, text: async () => 'Like failed' }); // Like failure
      
    render(<LikeButton videoId="ghi" initialCount={2} />);
    await waitFor(() => {
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-gray-600');
    });

    const likeButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(likeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      const thumbsUpButton = screen.getByText('👍');
      expect(thumbsUpButton.closest('button')).toHaveClass('text-gray-600');
    });
  });
});