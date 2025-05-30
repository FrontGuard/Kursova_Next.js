import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import '../styles/custom.css';

export const metadata: Metadata = {
  title: 'VideoHub',
  description: 'Курсова робота', // Змінено опис для кращої читабельності
  // Додано ключові слова для SEO (за потреби)
  keywords: ['відео', 'платформа', 'обмін відео', 'курсова робота'],
  // Встановлено URL канонічної сторінки (за потреби)
  // canonical: 'https://yourdomain.com/',
  // Встановлено мову (вже є в <html>)
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  // },
  // Open Graph метадані для кращого відображення в соціальних мережах
  openGraph: {
    title: 'VideoHub',
    description: 'Курсова робота - платформа обміну відео',
    url: 'http://localhost:3000/', // Замініть на свій реальний URL
    siteName: 'VideoHub',
    // images: [
    //   {
    //     url: 'https://yourdomain.com/og-image.png', // Замініть на URL вашого зображення OG
    //     width: 1200,
    //     height: 630,
    //     alt: 'Логотип VideoHub',
    //   },
    // ],
    locale: 'uk_UA',
    type: 'website',
  },
  // Twitter Card метадані (за потреби)
  // twitter: {
  //   card: 'summary_large_image',
  //   site: '@yourtwitterhandle',
  //   creator: '@yourtwitterhandle',
  //   title: 'VideoHub',
  //   description: 'Курсова робота - платформа обміну відео',
  //   images: ['https://yourdomain.com/twitter-image.png'], // Замініть на URL вашого зображення для Twitter
  // },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}