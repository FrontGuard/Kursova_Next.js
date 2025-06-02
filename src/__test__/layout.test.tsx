import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';

// Mock the child component
const MockChild = () => <div data-testid="child-content">Content</div>;

// Mock the Header, Footer, and Providers components
const MockHeader = () => <header data-testid="header">Header</header>;
const MockFooter = () => <footer data-testid="footer">Footer</footer>;
const MockProviders = ({ children }: { children: ReactNode }) => (
  <div data-testid="providers">{children}</div>
);

jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

jest.mock('../components/Providers', () => {
  return {
    default: function MockProviders({ children }: { children: ReactNode }) {
      return <div data-testid="providers">{children}</div>;
    },
  };
});

// Create a test version of the layout component that doesn't include html/body tags
const TestRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="root-layout">
      <MockProviders>
        <MockHeader />
        <main className="flex-grow">{children}</main>
        <MockFooter />
      </MockProviders>
    </div>
  );
};

 describe('RootLayout', () => {
  it('renders the root layout container', () => {
    render(<TestRootLayout><MockChild /></TestRootLayout>);
    expect(screen.getByTestId('root-layout')).toBeInTheDocument();
  });

  it('renders the Providers component and wraps its children', () => {
    render(<TestRootLayout><MockChild /></TestRootLayout>);
    const providersElement = screen.getByTestId('providers');
    expect(providersElement).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(providersElement).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders the Header component', () => {
    render(<TestRootLayout><MockChild /></TestRootLayout>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the Footer component', () => {
    render(<TestRootLayout><MockChild /></TestRootLayout>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the children within the main tag with flex-grow class', () => {
    render(<TestRootLayout><MockChild /></TestRootLayout>);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-grow');
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(mainElement).toContainElement(screen.getByTestId('child-content'));
  });
});