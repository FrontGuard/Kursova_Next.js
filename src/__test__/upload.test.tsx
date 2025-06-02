import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '../app/upload/page';
import { useRouter } from 'next/navigation';

// Мокаємо useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Мокаємо fetch
global.fetch = jest.fn();

describe('UploadPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('рендерить форму завантаження', () => {
    render(<UploadPage />);
    expect(screen.getByText('Завантаження відео')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Назва')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Опис (необов’язково)')).toBeInTheDocument();
    expect(screen.getByLabelText('Відеофайл')).toBeInTheDocument();
    expect(screen.getByLabelText('Заставка (thumbnail)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Завантажити' })).toBeInTheDocument();
  });

  it('показує помилку, якщо не заповнені обов’язкові поля', async () => {
    render(<UploadPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Завантажити' }));

    await waitFor(() => {
      expect(screen.getByText('Назва, відео та заставка обов’язкові')).toBeInTheDocument();
    });
  });

  it('відправляє форму і редіректить після успішного завантаження', async () => {
    render(<UploadPage />);

    const mockVideo = new File(['video-content'], 'video.mp4', { type: 'video/mp4' });
    const mockThumb = new File(['image-content'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByPlaceholderText('Назва'), {
      target: { value: 'Тестове відео' },
    });

    fireEvent.change(screen.getByLabelText('Відеофайл'), {
      target: { files: [mockVideo] },
    });

    fireEvent.change(screen.getByLabelText('Заставка (thumbnail)'), {
      target: { files: [mockThumb] },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Відео успішно додано' }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Завантажити' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
      expect(screen.getByText('Відео успішно додано')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/video');
    });
  });

  it('показує повідомлення про помилку з сервера', async () => {
    render(<UploadPage />);

    const mockVideo = new File(['video'], 'video.mp4', { type: 'video/mp4' });
    const mockThumb = new File(['thumb'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByPlaceholderText('Назва'), {
      target: { value: 'Тест' },
    });
    fireEvent.change(screen.getByLabelText('Відеофайл'), {
      target: { files: [mockVideo] },
    });
    fireEvent.change(screen.getByLabelText('Заставка (thumbnail)'), {
      target: { files: [mockThumb] },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Помилка завантаження з сервера' }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Завантажити' }));

    await waitFor(() => {
      expect(screen.getByText('Помилка завантаження з сервера')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('показує загальну помилку, якщо відповідь не є JSON', async () => {
    render(<UploadPage />);

    const mockVideo = new File(['video'], 'video.mp4', { type: 'video/mp4' });
    const mockThumb = new File(['thumb'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByPlaceholderText('Назва'), {
      target: { value: 'Тест' },
    });
    fireEvent.change(screen.getByLabelText('Відеофайл'), {
      target: { files: [mockVideo] },
    });
    fireEvent.change(screen.getByLabelText('Заставка (thumbnail)'), {
      target: { files: [mockThumb] },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Не JSON');
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Завантажити' }));

    await waitFor(() => {
      expect(screen.getByText('Невідома помилка сервера')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
