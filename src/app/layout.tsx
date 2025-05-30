import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import '../styles/custom.css';

export const metadata: Metadata = {
  title: 'VideoHub',
  description: 'Курсова робота - платформа обміну відеоконтентом', // Більш інформативний опис
  keywords: ['відео', 'платформа', 'обмін відео', 'курсова робота', 'відеохостинг'], // Додано релевантні ключові слова
  // canonical: 'https://yourdomain.com/', // Розкоментуйте та замініть на свій реальний URL
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  // },
  metadataBase: new URL(process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'), // Встановлено базовий URL
  openGraph: {
    title: 'VideoHub',
    description: 'Курсова робота - платформа обміну відеоконтентом',
    url: process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000/', // Використовуйте змінну середовища або реальний URL
    siteName: 'VideoHub',
    // images: [
    //   {
    //     url: '/og-image.png', // Рекомендовано використовувати відносний шлях, Next.js обробить metadataBase
    //     width: 1200,
    //     height: 630,
    //     alt: 'Логотип VideoHub',
    //   },
    // ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    // site: '@yourtwitterhandle', // Додайте свій Twitter handle
    // creator: '@yourtwitterhandle', // Додайте Twitter handle автора
    title: 'VideoHub',
    description: 'Курсова робота - платформа обміну відеоконтентом',
    // images: ['/twitter-image.png'], // Рекомендовано використовувати відносний шлях
  },
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