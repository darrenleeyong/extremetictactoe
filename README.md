# Extreme Tic Tac Toe

**Live at [https://extremetictactoe.com](https://extremetictactoe.com)**

A complex 3×3×3 strategy game featuring a pseudo-random shuffled sequence and advanced AI. Play **Extreme Tic Tac Toe** (also known as **Ultimate Tic Tac Toe**) with 10-level AI, sequential board logic, minimax algorithm, and alpha-beta pruning.

## Keywords

- **Extreme Tic Tac Toe** — The main game variant with 81 cells across 9 boards
- **Ultimate Tic Tac Toe** — Alternative name for the same game
- **Minimax Algorithm** — AI decision-making for optimal play at higher difficulty levels
- **Alpha-Beta Pruning** — Search optimization used in the AI engine
- **React Strategy Game** — Built with Next.js and React
- **81-Move Strategy Game** — Full game length with sequential board logic

## Features

- **10-Level AI** — From beginner to expert, powered by minimax with alpha-beta pruning
- **Sequential Board Logic** — Pseudo-random shuffled play order; each move determines the next board
- **Single Player vs CPU** — Challenge the AI at any difficulty (1–10)
- **2–4 Player Multiplayer** — Same-device play with X, O, △, □
- **Hell Mode** — Max difficulty with 5-second turn timer
- **Leaderboard** — Post scores and compete globally
- **Save/Load Games** — Persist progress (requires sign-in)

## Tech Stack

- **Next.js 15** — App Router, Metadata API, server components
- **React 18** — Client components for game state
- **TypeScript** — Full type safety
- **Tailwind CSS** — Styling
- **Supabase** — Auth, leaderboard, saved games
- **Web Workers** — Off-main-thread AI for levels 7–10

## Getting Started

```bash
npm install
npm run dev
```

Set up `.env.local` with your Supabase URL and anon key for auth and leaderboard features.

## Project Structure

- `app/` — Next.js App Router pages (home, game, leaderboard, auth)
- `components/` — GameBoard, SmallBoard, BoardStepper, dialogs
- `lib/` — gameLogic, cpuPlayer, scoring, Supabase client

## Favicons

- `public/favicon.svg` — Modern browsers
- `public/apple-touch-icon.png` — iOS home screen
- Optional: Add `favicon.ico` (32×32) for legacy browsers

## SEO & Accessibility

- Dynamic meta tags, Open Graph, and Twitter Cards
- JSON-LD VideoGame schema
- Semantic HTML (`<main>`, `<section>`, `<article>`, `<footer>`)
- `robots.txt` and `sitemap.xml`
- `aria-label`s on all game cells for screen readers
