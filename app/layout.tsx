import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeRegistry } from '@/lib/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderAuth from '@/components/HeaderAuth';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Extreme Tic Tac Toe',
  description: 'Play Extreme (Ultimate) Tic Tac Toe - single player vs CPU or two players on the same device.',
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
          <header className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 max-w-screen-sm mx-auto">
              <span className="font-semibold text-lg tracking-tight">Extreme Tic Tac Toe</span>
              <div className="flex items-center gap-3">
                <HeaderAuth />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
