import { render, screen } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import Header from '../components/Header'; // Adjust the import path if necessary
 import Link from 'next/link';

 // Mock the next/link component
 jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  };
 });

 describe('Header', () => {
  it('renders the logo with a link to the video page', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: '🎬 BenFube' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/video');
    expect(logoLink).toHaveClass('logo');
  });

  it('renders the "Головна" link to the video page', () => {
    render(<Header />);
    const homeLink = screen.getByRole('link', { name: 'Головна' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/video');
  });

  it('renders the "Завантажити" link to the upload page', () => {
    render(<Header />);
    const uploadLink = screen.getByRole('link', { name: 'Завантажити' });
    expect(uploadLink).toBeInTheDocument();
    expect(uploadLink).toHaveAttribute('href', '/upload');
  });

  it('renders the "Профіль" link to the profile page', () => {
    render(<Header />);
    const profileLink = screen.getByRole('link', { name: 'Профіль' });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('renders the header element with the "site-header" class', () => {
    render(<Header />);
    const headerElement = screen.getByRole('banner'); // <header> has the implicit banner role
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass('site-header');
  });

  it('renders the navigation element', () => {
    render(<Header />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });

  it('renders all links within the navigation', () => {
    render(<Header />);
    const navigationElement = screen.getByRole('navigation');
    const links = within(navigationElement).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent('Головна');
    expect(links[1]).toHaveTextContent('Завантажити');
    expect(links[2]).toHaveTextContent('Профіль');
  });
});

 import { within } from '@testing-library/dom';