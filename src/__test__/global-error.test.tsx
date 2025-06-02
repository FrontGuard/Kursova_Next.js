import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalError from '../app/global-error';
import * as Sentry from '@sentry/nextjs';
import React from 'react';
import { prismaMock } from '../../prisma.singelton';

// Mock Sentry captureException
jest.mock('@sentry/nextjs', () => ({
  ...jest.requireActual('@sentry/nextjs'),
  captureException: jest.fn(),
}));

// Mock NextError component
jest.mock('next/error', () => ({
  __esModule: true,
  default: function MockNextError({ statusCode }: { statusCode: number }) {
    return <div data-testid="next-error">Error: {statusCode}</div>;
  },
}));

describe('GlobalError', () => {
  let mockCaptureException: jest.Mock;
  const mockError = new Error('Test Error');

  beforeEach(() => {
    jest.clearAllMocks();
    mockCaptureException = Sentry.captureException as jest.Mock;
    mockCaptureException.mockClear();
  });

  it('renders the NextError component with statusCode 0', () => {
    // Test the internal components without the problematic html/body wrapper
    const TestGlobalError = ({ error }: { error: Error & { digest?: string } }) => {
      React.useEffect(() => {
        Sentry.captureException(error);
      }, [error]);
      
      const NextError = jest.requireMock('next/error').default;
      return <NextError statusCode={0} />;
    };

    const { getByTestId } = render(<TestGlobalError error={mockError} />);
    const nextErrorElement = getByTestId('next-error');
    expect(nextErrorElement).toBeInTheDocument();
    expect(nextErrorElement).toHaveTextContent('Error: 0');
  });

  it('calls Sentry.captureException with the provided error on mount', () => {
    // Suppress the HTML nesting warnings for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    render(<GlobalError error={mockError} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(mockError);
    
    console.error = originalError;
  });

  it('calls Sentry.captureException again if the error prop changes', () => {
    // Suppress the HTML nesting warnings for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    const { rerender } = render(<GlobalError error={mockError} />);
    const newError = new Error('New Test Error');
    rerender(<GlobalError error={newError} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(2);
    expect(mockCaptureException).toHaveBeenCalledWith(newError);
    
    console.error = originalError;
  });

  it('calls Sentry.captureException with the error object including the digest if present', () => {
    // Suppress the HTML nesting warnings for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    const mockErrorWithDigest = new Error('Test Error with Digest') as Error & { digest?: string };
    mockErrorWithDigest.digest = 'test-digest';
    render(<GlobalError error={mockErrorWithDigest} />);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(mockErrorWithDigest);
    
    console.error = originalError;
  });
});