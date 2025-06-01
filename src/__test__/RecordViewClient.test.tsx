import { render, waitFor } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import RecordViewClient from '../components/RecordViewClient'; // Adjust import path
 import { useSession } from 'next-auth/react';

 // Mock the useSession hook
 jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
 }));

 // Mock the global fetch API
 global.fetch = jest.fn();

 describe('RecordViewClient', () => {
  let mockUseSession: jest.Mock;

  beforeEach(() => {
    mockUseSession = useSession as jest.Mock;
    (global.fetch as jest.Mock).mockClear();
  });

  it('does not call fetch if there is no session', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<RecordViewClient videoId="test-id" />);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls fetch with the videoId if there is a session', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    render(<RecordViewClient videoId="another-id" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/views', {
        method: 'POST',
        body: JSON.stringify({ videoId: 'another-id' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('calls fetch again if videoId changes and there is a session', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    const { rerender } = render(<RecordViewClient videoId="initial-id" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    (global.fetch as jest.Mock).mockClear(); // Clear call count for the rerender check

    rerender(<RecordViewClient videoId="new-id" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/views', {
        method: 'POST',
        body: JSON.stringify({ videoId: 'new-id' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('calls fetch again if session changes from null to a session', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const { rerender } = render(<RecordViewClient videoId="test-id" />);
    expect(global.fetch).not.toHaveBeenCalled();

    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    rerender(<RecordViewClient videoId="test-id" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/views', {
        method: 'POST',
        body: JSON.stringify({ videoId: 'test-id' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('does not call fetch again if session remains the same and videoId is the same', async () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    const { rerender } = render(<RecordViewClient videoId="same-id" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    (global.fetch as jest.Mock).mockClear();

    rerender(<RecordViewClient videoId="same-id" />);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('renders null', () => {
    mockUseSession.mockReturnValue({ data: { user: { id: 'user1' } }, status: 'authenticated' });
    const { container } = render(<RecordViewClient videoId="test-id" />);
    expect(container.firstChild).toBeNull();
  });
});