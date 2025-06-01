import { render, screen } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import HomePage from '../app/page'; // Adjust the import path if necessary
 import Link from 'next/link';

 // Mock the next/link component
 jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  };
 });

 describe('HomePage', () => {
  it('renders the welcome title', () => {
    render(<HomePage />);
    const titleElement = screen.getByText('Вітаємо у нашому відео-проєкті!');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('title');
  });

  it('renders the description text', () => {
    render(<HomePage />);
    const descriptionElement = screen.getByText('Тут ви зможете знайти та переглянути різноманітні цікаві відео. Перейдіть на сторінку відео, щоб побачити всю колекцію.');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('description');
  });

  it('renders the "Перейти до відео" link to /video', () => {
    render(<HomePage />);
    const videoLink = screen.getByRole('link', { name: 'Перейти до відео' });
    expect(videoLink).toBeInTheDocument();
    expect(videoLink).toHaveAttribute('href', '/video');
    expect(videoLink).toHaveClass('videoButton');
  });

  it('renders the main container with the "container" class', () => {
    render(<HomePage />);
    const containerElement = screen.getByRole('main').closest('div');
    expect(containerElement).toBeInTheDocument();
    expect(containerElement).toHaveClass('container');
  });

  it('renders the main element with the "main" class', () => {
    render(<HomePage />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('main');
  });

  it('renders the button container with the "buttonContainer" class', () => {
    render(<HomePage />);
    const buttonContainerElement = screen.getByRole('link', { name: 'Перейти до відео' }).closest('div');
    expect(buttonContainerElement).toBeInTheDocument();
    expect(buttonContainerElement).toHaveClass('buttonContainer');
  });

  it('renders the footer element with the "footer" class', () => {
    render(<HomePage />);
    const footerElement = screen.getByRole('contentinfo'); // <footer /> has the implicit contentinfo role
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass('footer');
  });
});