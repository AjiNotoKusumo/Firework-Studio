import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import "toastify-js/src/toastify.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'FireWork - Social Media Analytics',
  description: 'Track trends, discover content, and grow your social presence',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/firework.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/firework.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/firework.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/firework.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
