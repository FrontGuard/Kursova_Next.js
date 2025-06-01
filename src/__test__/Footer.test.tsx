import { render, screen, within } from '@testing-library/react';
 import '@testing-library/jest-dom';
 import Footer from '../components/Footer'; // Adjust the import path if necessary

 describe('Footer', () => {
  it('renders the copyright information with the current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(`© ${currentYear} VideoHub. Всі права захищено.`);
    expect(copyrightText).toBeInTheDocument();
  });

  it('renders the privacy policy link', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: 'Політика конфіденційності' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders the terms of use link', () => {
    render(<Footer />);
    const termsLink = screen.getByRole('link', { name: 'Умови користування' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders both privacy and terms links separated by a "|"', () => {
    render(<Footer />);
    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('renders the copyright text and links within a <p> tag', () => {
    render(<Footer />);
    const paragraphElement = screen.getByText(`© ${new Date().getFullYear()} VideoHub. Всі права захищено.`).closest('p');
    expect(paragraphElement).toBeInTheDocument();
    expect(within(paragraphElement!).getByRole('link', { name: 'Політика конфіденційності' })).toBeInTheDocument();
    expect(within(paragraphElement!).getByRole('link', { name: 'Умови користування' })).toBeInTheDocument();
  });
});