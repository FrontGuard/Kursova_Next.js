import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../app/login/page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage', () => {
  let mockRouterPush: jest.Mock;
  let mockSignIn: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValue(null); // Default successful sign-in
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByText('Вхід до акаунту')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
    expect(screen.getByText('Немає акаунта?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Зареєструватись' })).toHaveAttribute('href', '/register');
  });

  it('updates email and password state on input change', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    expect((passwordInput as HTMLInputElement).value).toBe('password123');
  });

  it('calls signIn with correct credentials on form submission and redirects on success', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const loginButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('displays an error message if signIn returns an error', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const loginButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Невірний email або пароль')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('does not redirect if signIn has an error', async () => {
    mockSignIn.mockResolvedValue({ error: 'Some error' });
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const loginButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('does not call signIn if email or password are empty on submit', async () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1); // Now it should be called
    });
  });
});