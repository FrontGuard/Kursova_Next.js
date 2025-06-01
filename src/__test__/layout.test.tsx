import { render, screen } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import RootLayout from '../app/layout'; // Adjust the import path if necessary
 import Header from '../components/Header';
 import Footer from '../components/Footer';
 import Providers from '../components/Providers';
 import { ReactNode } from 'react';

 // Mock the child component
 const MockChild = () => <div data-testid="child-content">Content</div>;

 // Mock the Header, Footer, and Providers components
 jest.mock('../components/Header', () => () => <header data-testid="header">Header</header>);
 jest.mock('../components/Footer', () => () => <footer data-testid="footer">Footer</footer>);
 jest.mock('../components/Providers', () => ({
  default: ({ children }: { children: ReactNode }) => (
   <div data-testid="providers">{children}</div>
  ),
 }));

 describe('RootLayout', () => {
  it('renders the html tag with lang="uk"', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    expect(document.documentElement).toHaveAttribute('lang', 'uk');
  });

  it('renders the body tag with the correct classes', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    expect(document.body).toHaveClass('flex');
    expect(document.body).toHaveClass('flex-col');
    expect(document.body).toHaveClass('min-h-screen');
  });

  it('renders the Providers component and wraps its children', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    const providersElement = screen.getByTestId('providers');
    expect(providersElement).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(providersElement).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders the Header component', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the Footer component', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the children within the main tag with flex-grow class', () => {
    render(<RootLayout>{<MockChild />}</RootLayout>);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-grow');
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(mainElement).toContainElement(screen.getByTestId('child-content'));
  });
});