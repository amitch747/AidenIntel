import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/w95.css';
import localFont from 'next/font/local';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
const w95Font = localFont({
  src: [
    {
      path: '../public/fonts/w95fa.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/w95fa.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-w95',
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'AI-OS',
  description: 'Future',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={w95Font.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${w95Font.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
