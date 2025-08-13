import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JA-CMS - Modern Content Management System',
  description: 'Modern Content Management System built with Next.js and shadcn/ui',
  keywords: ['CMS', 'Content Management', 'Next.js', 'React'],
  authors: [{ name: 'JA CMS Team' }],
  creator: 'JA CMS Team',
  publisher: 'JA CMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JA-CMS - Modern Content Management System',
    description: 'Modern Content Management System built with Next.js and shadcn/ui',
    url: 'http://localhost:3000',
    siteName: 'JA-CMS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JA-CMS',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JA-CMS - Modern Content Management System',
    description: 'Modern Content Management System built with Next.js and shadcn/ui',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 