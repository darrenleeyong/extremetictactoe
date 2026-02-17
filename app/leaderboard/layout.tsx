import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Top scores for Extreme Tic Tac Toe. Compete against players worldwide.',
  alternates: {
    canonical: 'https://extremetictactoe.com/leaderboard',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
