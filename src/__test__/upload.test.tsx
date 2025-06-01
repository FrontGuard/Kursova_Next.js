import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '../app/upload/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the global fetch API
global.fetch = jest.fn();

describe('UploadPage', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the upload form correctly', () => {
    render(<UploadPage />);
    expect(screen.getByText('Завантаження відео')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Назва')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Опис (необов’язково)')).toBeInTheDocument();
    expect(screen.getByLabelText('Відеофайл')).toBeInTheDocument();
    expect(screen.getByLabelText('Заставка (thumbnail)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Завантажити' })).toBeInTheDocument();
  });

  it('updates title, description, videoFile, and thumbFile state on input change', () => {
    render(<UploadPage />);
    const titleInput = screen.getByPlaceholderText('Назва');
    const descriptionInput = screen.getByPlaceholderText('Опис (необов’язково)');
    const videoFileInput = screen.getByLabelText('Відеофайл');
    const thumbFileInput = screen.getByLabelText('Заставка (thumbnail)');
    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(titleInput, { target: { value: 'Тестове відео' } });
    fireEvent.change(descriptionInput, { target: { value: 'Опис тестового відео' } });
    fireEvent.change(videoFileInput, { target: { files: [mockVideoFile] } });
    fireEvent.change(thumbFileInput, { target: { files: [mockThumbFile] } });

    expect((titleInput as HTMLInputElement).value).toBe('Тестове відео');
    expect((descriptionInput as HTMLTextAreaElement).value).toBe('Опис тестового відео');
    expect((videoFileInput as HTMLInputElement).files?.[0]).toBe(mockVideoFile);
    expect((thumbFileInput as HTMLInputElement).files?.[0]).toBe(mockThumbFile);
  });

  it('displays an error message if required fields are missing on submit', async () => {
    render(<UploadPage />);
    const uploadButton = screen.getByRole('button', { name: 'Завантажити' });
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByText('Назва, відео та заставка обов’язкові')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Назва'), { target: { value: 'Тест' } });
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByText('Назва, відео та заставка обов’язкові')).toBeInTheDocument();
    });

    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByLabelText('Відеофайл'), { target: { files: [mockVideoFile] } });
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByText('Назва, відео та заставка обов’язкові')).toBeInTheDocument();
    });

    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Заставка (thumbnail)'), { target: { files: [mockThumbFile] } });
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.queryByText('Назва, відео та заставка обов’язкові')).toBeNull();
    });
  });

  it('calls the upload API with correct data on successful form submission and redirects', async () => {
    render(<UploadPage />);
    const titleInput = screen.getByPlaceholderText('Назва');
    const videoFileInput = screen.getByLabelText('Відеофайл');
    const thumbFileInput = screen.getByLabelText('Заставка (thumbnail)');
    const uploadButton = screen.getByRole('button', { name: 'Завантажити' });
    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(titleInput, { target: { value: 'Тестове відео' } });
    fireEvent.change(videoFileInput, { target: { files: [mockVideoFile] } });
    fireEvent.change(thumbFileInput, { target: { files: [mockThumbFile] } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Відео успішно додано' }),
    });

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(FormData));
      const formData = (global.fetch as jest.Mock).mock.calls[0][1]?.body as FormData;
      expect(formData.get('title')).toBe('Тестове відео');
      expect(formData.get('video')).toBe(mockVideoFile);
      expect(formData.get('thumbnail')).toBe(mockThumbFile);
    });

    await waitFor(() => {
      expect(screen.getByText('Відео успішно додано')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/video');
    });
  });

  it('displays an error message if the upload API returns an error', async () => {
    render(<UploadPage />);
    const titleInput = screen.getByPlaceholderText('Назва');
    const videoFileInput = screen.getByLabelText('Відеофайл');
    const thumbFileInput = screen.getByLabelText('Заставка (thumbnail)');
    const uploadButton = screen.getByRole('button', { name: 'Завантажити' });
    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(titleInput, { target: { value: 'Тестове відео' } });
    fireEvent.change(videoFileInput, { target: { files: [mockVideoFile] } });
    fireEvent.change(thumbFileInput, { target: { files: [mockThumbFile] } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Помилка завантаження з сервера' }),
    });

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Помилка завантаження з сервера')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('displays a generic error message if the upload API returns a non-JSON error', async () => {
    render(<UploadPage />);
    const titleInput = screen.getByPlaceholderText('Назва');
    const videoFileInput = screen.getByLabelText('Відеофайл');
    const thumbFileInput = screen.getByLabelText('Заставка (thumbnail)');
    const uploadButton = screen.getByRole('button', { name: 'Завантажити' });
    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(titleInput, { target: { value: 'Тестове відео' } });
    fireEvent.change(videoFileInput, { target: { files: [mockVideoFile] } });
    fireEvent.change(thumbFileInput, { target: { files: [mockThumbFile] } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'Internal Server Error',
    });

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Помилка при завантаженні')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('handles non-JSON response during error parsing', async () => {
    render(<UploadPage />);
    const titleInput = screen.getByPlaceholderText('Назва');
    const videoFileInput = screen.getByLabelText('Відеофайл');
    const thumbFileInput = screen.getByLabelText('Заставка (thumbnail)');
    const uploadButton = screen.getByRole('button', { name: 'Завантажити' });
    const mockVideoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
    const mockThumbFile = new File(['image'], 'thumb.jpg', { type: 'image/jpeg' });

    fireEvent.change(titleInput, { target: { value: 'Тестове відео' } });
    fireEvent.change(videoFileInput, { target: { files: [mockVideoFile] } });
    fireEvent.change(thumbFileInput, { target: { files: [mockThumbFile] } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => { throw new Error('Failed to parse JSON'); },
      text: async () => 'Internal Server Error',
    });

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Невідома помилка сервера')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});