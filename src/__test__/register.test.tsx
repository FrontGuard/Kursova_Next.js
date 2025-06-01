import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import RegisterPage from '../app/register/page';

// Мокуємо useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterPage', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    // Створюємо мок для router.push перед кожним тестом
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    // Мокуємо fetch API
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Очищаємо моки після кожного тесту
    jest.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: 'Реєстрація' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Імʼя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зареєструватися' })).toBeInTheDocument();
    expect(screen.getByText('Вже є акаунт?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('displays an error message if required fields are empty on submit', async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));
    await waitFor(() => {
      expect(screen.getByText('Усі поля обовʼязкові')).toBeInTheDocument();
    });
  });

  it('sends registration data to the API and redirects on successful registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Успішна реєстрація' }),
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Імʼя'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
      expect(screen.getByText('Успішно зареєстровано!')).toBeInTheDocument();
    });
  });

  it('displays an error message if registration fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Помилка реєстрації: Email вже використовується' }),
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Імʼя'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Помилка реєстрації: Email вже використовується')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('displays a generic error message if the server returns an error without a message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // Server returns an empty JSON object
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Імʼя'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Помилка при реєстрації')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('displays a generic error message if JSON parsing fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid JSON', // Server returns invalid JSON
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Імʼя'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Невідома помилка сервера')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});