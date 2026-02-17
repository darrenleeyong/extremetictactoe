import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeRegistry } from '@/lib/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderAuth from '@/components/HeaderAuth';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const SITE_URL = 'https://extremetictactoe.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Extreme Tic Tac Toe | The Ultimate 81-Move Strategy Game',
    template: '%s | Extreme Tic Tac Toe',
  },
  description:
    'Play Extreme Tic Tac Toe (Ultimate Tic Tac Toe) with 10-level AI, sequential board logic, and pseudo-random shuffled play order. Single player vs CPU or 2–4 players on the same device. Features minimax algorithm and alpha-beta pruning.',
  keywords: [
    'Extreme Tic Tac Toe',
    'Ultimate Tic Tac Toe',
    'strategy game',
    'minimax algorithm',
    'alpha-beta pruning',
    'React strategy game',
    'board game',
    '81-move game',
  ],
  authors: [{ name: 'Extreme Tic Tac Toe' }],
  creator: 'Extreme Tic Tac Toe',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Extreme Tic Tac Toe',
    title: 'Extreme Tic Tac Toe | The Ultimate 81-Move Strategy Game',
    description:
      'Play Extreme Tic Tac Toe with 10-level AI, sequential board logic, and pseudo-random shuffled play order. Single player vs CPU or 2–4 players.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Extreme Tic Tac Toe - The Ultimate 81-Move Strategy Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Extreme Tic Tac Toe | The Ultimate 81-Move Strategy Game',
    description:
      'Play Extreme Tic Tac Toe with 10-level AI, sequential board logic, and pseudo-random shuffled play order.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=localStorage.getItem('extreme-ttt-theme');document.documentElement.classList.toggle('dark',m!=='light');})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased">
        <ThemeRegistry>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'VideoGame',
                name: 'Extreme Tic Tac Toe',
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web',
                description:
                  'A complex 3x3x3 strategy game featuring a pseudo-random shuffled sequence and advanced AI. Play Extreme (Ultimate) Tic Tac Toe with 10-level AI, sequential board logic, minimax algorithm, and alpha-beta pruning. Single player vs CPU or 2–4 players on the same device.',
                url: SITE_URL,
                author: { '@type': 'Organization', name: 'Extreme Tic Tac Toe' },
              }),
            }}
          />
          <header className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 max-w-screen-sm mx-auto">
              <Link href="/" className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity">
                Extreme Tic Tac Toe
              </Link>
              <div className="flex items-center gap-3">
                <HeaderAuth />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col" id="main-content">
            {children}
          </main>
          <footer className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800 py-4 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <p>Extreme Tic Tac Toe — The Ultimate 81-Move Strategy Game</p>
          </footer>
        </ThemeRegistry>
      </body>
    </html>
  );
}
