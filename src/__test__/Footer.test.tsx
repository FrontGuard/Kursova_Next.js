import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../components/Footer';

describe('Footer', () => {  it('renders the copyright information with the current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    // Check for the copyright text with year - using getAllByText to find text across elements
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent(`© ${currentYear} VideoHub. Всі права захищено.`);
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
    // Check that both links exist and are in the same parent element
    const privacyLink = screen.getByRole('link', { name: 'Політика конфіденційності' });
    const termsLink = screen.getByRole('link', { name: 'Умови користування' });
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
  });

  it('renders the copyright text and links within a <p> tag', () => {
    render(<Footer />);
    // Find the paragraph element by role or tag
    const paragraphElement = screen.getByRole('contentinfo').querySelector('p');
    expect(paragraphElement).toBeInTheDocument();
    expect(within(paragraphElement!).getByRole('link', { name: 'Політика конфіденційності' })).toBeInTheDocument();
    expect(within(paragraphElement!).getByRole('link', { name: 'Умови користування' })).toBeInTheDocument();
  });
});