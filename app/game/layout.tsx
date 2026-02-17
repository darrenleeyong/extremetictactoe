import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play Game',
  description:
    'Play Extreme Tic Tac Toe - single player vs 10-level AI or 2–4 players. Sequential board logic, minimax algorithm, Hell Mode.',
  alternates: {
    canonical: 'https://extremetictactoe.com/game',
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
