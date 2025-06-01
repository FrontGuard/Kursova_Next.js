import { render, screen } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import Providers from '../components/Providers'; // Adjust the import path if necessary
 import { SessionProvider } from 'next-auth/react';
 import { ReactNode } from 'react';

 // Mock the SessionProvider
 jest.mock('next-auth/react', () => ({
  SessionProvider: jest.fn(({ children }) => <div data-testid="mock-session-provider">{children}</div>),
 }));

 describe('Providers', () => {
  it('renders the SessionProvider with the provided children', () => {
    const children = <div data-testid="child">Test Child</div>;
    render(<Providers>{children}</Providers>);

    const mockSessionProvider = screen.getByTestId('mock-session-provider');
    expect(mockSessionProvider).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockSessionProvider).toContainElement(screen.getByTestId('child'));
  });

  it('renders the SessionProvider even if no children are provided', () => {
    render(<Providers>{null}</Providers>); // Explicitly pass null as children
    const mockSessionProvider = screen.getByTestId('mock-session-provider');
    expect(mockSessionProvider).toBeInTheDocument();
    expect(mockSessionProvider).toBeEmptyDOMElement();
  });
});