import type {Metadata} from 'next';
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const mono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "Digital Product Passport - Tchibo",
  description: "Men's Shorty Pyjamas, Modal · Tchibo",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} ${mono.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="font-sans bg-bg text-ink text-[15px] leading-[1.6] antialiased">
        {children}
      </body>
    </html>
  );
}
