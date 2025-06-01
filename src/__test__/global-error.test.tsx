import { render } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import GlobalError from '../app/global-error'; // Assuming GlobalError.tsx is in the 'app' directory
 import * as Sentry from '@sentry/nextjs';
 import NextError from 'next/error';

 // Mock Sentry captureException
 jest.mock('@sentry/nextjs', () => ({
  ...jest.requireActual('@sentry/nextjs'), // Import other Sentry functions
  captureException: jest.fn(),
 }));

 // Mock NextError component
 jest.mock('next/error', () => {
  return function MockNextError({ statusCode }: { statusCode: number }) {
    return <div data-testid="next-error">Error: {statusCode}</div>;
  };
 });

 describe('GlobalError', () => {
  let mockCaptureException: jest.Mock;
  const mockError = new Error('Test Error');

  beforeEach(() => {
    mockCaptureException = Sentry.captureException as jest.Mock;
    mockCaptureException.mockClear();
  });

  it('renders the NextError component with statusCode 0', () => {
    const { getByTestId } = render(<GlobalError error={mockError} />);
    const nextErrorElement = getByTestId('next-error');
    expect(nextErrorElement).toBeInTheDocument();
    expect(nextErrorElement).toHaveTextContent('Error: 0');
  });

  it('calls Sentry.captureException with the provided error on mount', () => {
    render(<GlobalError error={mockError} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(mockError);
  });

  it('calls Sentry.captureException again if the error prop changes', () => {
    const { rerender } = render(<GlobalError error={mockError} />);
    const newError = new Error('New Test Error');
    rerender(<GlobalError error={newError} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(2);
    expect(mockCaptureException).toHaveBeenCalledWith(newError);
  });

  it('calls Sentry.captureException with the error object including the digest if present', () => {
    const mockErrorWithDigest = new Error('Test Error with Digest') as Error & { digest?: string };
    mockErrorWithDigest.digest = 'test-digest';
    render(<GlobalError error={mockErrorWithDigest} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(mockErrorWithDigest);
  });
});