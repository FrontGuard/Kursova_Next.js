import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminPage from '../app/admin/page';
import { prismaMock } from '../../prisma.singelton';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the global fetch API
global.fetch = jest.fn();
global.confirm = jest.fn();

describe('AdminPage', () => {
  let mockRouterPush: jest.Mock;
  let mockUseSession: jest.Mock;
  let mockConfirm: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    mockUseSession = useSession as jest.Mock;
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });

    (global.fetch as jest.Mock).mockClear();
    mockConfirm = global.confirm as jest.Mock;
    mockConfirm.mockReturnValue(true); // Default confirm to true
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders loading state initially', () => {
    render(<AdminPage />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('redirects to home page if user is not an admin', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'user' } }, status: 'authenticated' });
    render(<AdminPage />);
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('fetches videos and users on successful admin authentication', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'a', name: 'Admin', email: 'admin@example.com', role: 'admin' }] });

    render(<AdminPage />);    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/videos', { credentials: 'include' });
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', { credentials: 'include' });
    });

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Адмін-панель' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Відео' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Користувачі' })).toBeInTheDocument();
        expect(screen.getByText('Video 1')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays "Немає відео" if no videos are fetched', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'a', name: 'Admin', email: 'admin@example.com', role: 'admin' }] });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Немає відео')).toBeInTheDocument();
    });
  });

  it('displays "Немає користувачів" if no users are fetched', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Немає користувачів')).toBeInTheDocument();
    });
  });

  it('handles video deletion successfully', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin', id: 'adminId' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'a', name: 'User 1', email: 'user1@example.com', role: 'user' }] })
      .mockResolvedValueOnce({ ok: true }); // Mock for delete video

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });

    const videoItem = screen.getByText('Video 1').closest('li');
    const deleteButton = within(videoItem).getByRole('button', { name: 'Видалити' });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Точно видалити відео?');
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: '1' }),
      credentials: 'include',
    });

    await waitFor(() => {
      expect(screen.queryByText('Video 1')).toBeNull();
    });
  });

  it('handles video deletion failure', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin', id: 'adminId' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'a', name: 'User 1', email: 'user1@example.com', role: 'user' }] })
      .mockResolvedValueOnce({ ok: false, text: async () => 'Failed to delete video' });

    (global.confirm as jest.Mock).mockReturnValue(true);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });

    const videoItem = screen.getByText('Video 1').closest('li');
    const deleteButton = within(videoItem).getByRole('button', { name: 'Видалити' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Помилка під час видалення відео');
    });

    alertSpy.mockRestore();
  });
  it('handles user deletion successfully', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin', id: 'adminId' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'b', name: 'User 2', email: 'user2@example.com', role: 'user' }] })
      .mockResolvedValueOnce({ ok: true }); // Mock for delete user

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    const userItems = screen.getAllByText('Видалити');
    const userDeleteButton = userItems.find(button => 
      button.closest('li')?.querySelector('strong')?.textContent === 'User 2'
    );
    
    fireEvent.click(userDeleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Видалити користувача?');
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/deleteUser/b', { method: 'DELETE' });

    await waitFor(() => {
      expect(screen.queryByText('User 2')).toBeNull();
    });
  });
  it('handles user deletion failure', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin', id: 'adminId' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'b', name: 'User 2', email: 'user2@example.com', role: 'user' }] })
      .mockResolvedValueOnce({ ok: false, text: async () => 'Failed to delete user' });

    (global.confirm as jest.Mock).mockReturnValue(true);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    const userItems = screen.getAllByText('Видалити');
    const userDeleteButton = userItems.find(button => 
      button.closest('li')?.querySelector('strong')?.textContent === 'User 2'
    );
    
    fireEvent.click(userDeleteButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Помилка при видаленні користувача');
    });

    alertSpy.mockRestore();
  });
  it('prevents admin from deleting themselves', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin', id: 'adminId' } }, status: 'authenticated' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', title: 'Video 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'adminId', name: 'Admin', email: 'admin@example.com', role: 'admin' }] });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    // Admin users should not have a delete button (role !== "admin" check in component)
    const userItems = screen.queryAllByText('Видалити');
    const adminListItem = screen.getByText('Admin').closest('li');
    const deleteButtonInAdminItem = within(adminListItem).queryByText('Видалити');
    
    expect(deleteButtonInAdminItem).toBeNull(); // Admin should not have delete button

    alertSpy.mockRestore();
  });
  it('handles fetch errors', async () => {
    mockUseSession.mockReturnValue({ data: { user: { role: 'admin' } }, status: 'authenticated' });
    const errorMessage = 'Failed to fetch data';
    (global.fetch as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Component makes two fetch requests
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(screen.getByText('Немає відео')).toBeInTheDocument();
      expect(screen.getByText('Немає користувачів')).toBeInTheDocument();
    });
  });
});