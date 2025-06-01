import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../app/profile/page';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the global fetch API
global.fetch = jest.fn();
global.confirm = jest.fn();

const mockVideos = [
  { id: '1', title: 'Моє перше відео' },
  { id: '2', title: 'Ще одне чудове відео' },
];

describe('ProfilePage', () => {
  let mockUseSession: jest.Mock;
  let mockSignOut: jest.Mock;
  let mockRouterPush: jest.Mock;
  let mockConfirm: jest.Mock;

  beforeEach(() => {
    mockUseSession = useSession as jest.Mock;
    mockSignOut = signOut as jest.Mock;
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    mockConfirm = global.confirm as jest.Mock;
    mockConfirm.mockReturnValue(true); // Default confirm to true
    (global.fetch as jest.Mock).mockClear();
    mockUseSession.mockReturnValue({ data: { user: { name: 'Тестовий Користувач', email: 'test@example.com' } }, status: 'authenticated' });
  });

  it('renders loading state initially if session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    render(<ProfilePage />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('redirects to /login if no session', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<ProfilePage />);
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  it('renders user info and videos on successful authentication', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Профіль')).toBeInTheDocument();
      expect(screen.getByText('Імʼя: Тестовий Користувач')).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Моє перше відео')).toBeInTheDocument();
      expect(screen.getByText('Ще одне чудове відео')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Видалити акаунт' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Вийти з акаунту' })).toBeInTheDocument();
      const firstVideoItem = screen.getByText('Моє перше відео').closest('li');
      const secondVideoItem = screen.getByText('Ще одне чудове відео').closest('li');
      expect(within(firstVideoItem).getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
      expect(within(secondVideoItem).getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/profile/videos', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('displays "Ви ще не додали жодного відео." if no videos are fetched', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Ви ще не додали жодного відео.')).toBeInTheDocument();
    });
  });

  it('handles video deletion successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true }); // Mock for delete video

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Моє перше відео')).toBeInTheDocument();
    });

    const firstVideoItem = screen.getByText('Моє перше відео').closest('li');
    const deleteButton = within(firstVideoItem).getByRole('button', { name: 'Видалити' });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Ви дійсно хочете видалити це відео?');
    expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
      method: 'DELETE',
      credentials: 'include',
    });

    await waitFor(() => {
      expect(screen.queryByText('Моє перше відео')).toBeNull();
    });
  });

  it('handles video deletion failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false }); // Mock for delete video failure
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Моє перше відео')).toBeInTheDocument();
    });

    const firstVideoItem = screen.getByText('Моє перше відео').closest('li');
    const deleteButton = within(firstVideoItem).getByRole('button', { name: 'Видалити' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Помилка під час видалення відео');
    });

    alertSpy.mockRestore();
  });

  it('handles account deletion successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true }); // Mock for delete account

    render(<ProfilePage />);

    const deleteAccountButton = screen.getByRole('button', { name: 'Видалити акаунт' });
    fireEvent.click(deleteAccountButton);

    expect(global.confirm).toHaveBeenCalledWith('Ви дійсно хочете видалити свій акаунт? Це дію неможливо скасувати.');
    expect(global.fetch).toHaveBeenCalledWith('/api/profile/deleteAccount', {
      method: 'DELETE',
      credentials: 'include',
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });

  it('handles account deletion failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false }); // Mock for delete account failure
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ProfilePage />);

    const deleteAccountButton = screen.getByRole('button', { name: 'Видалити акаунт' });
    fireEvent.click(deleteAccountButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Помилка при видаленні акаунта');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it('calls signOut on logout button click', () => {
    render(<ProfilePage />);
    const logoutButton = screen.getByRole('button', { name: 'Вийти з акаунту' });
    fireEvent.click(logoutButton);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('updates name and password and calls update API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Success' }) });

    render(<ProfilePage />);

    const nameInput = screen.getByPlaceholderText('Нове імʼя');
    const passwordInput = screen.getByPlaceholderText('Новий пароль');
    const updateButton = screen.getByRole('button', { name: 'Оновити' });

    fireEvent.change(nameInput, { target: { value: 'Нове Імʼя' } });
    fireEvent.change(passwordInput, { target: { value: 'новийпароль' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profile/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Нове Імʼя', password: 'новийпароль' }),
      });
      expect(screen.getByText('✅ Дані успішно оновлено. Увійдіть знову.')).toBeInTheDocument();
    });
  });

  it('displays error message on update failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Помилка оновлення' }) });

    render(<ProfilePage />);

    const updateButton = screen.getByRole('button', { name: 'Оновити' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Помилка оновлення')).toBeInTheDocument();
    });
  });
});