# QFactor — Quiz Event Tracking App

## Project Structure

```
qfactor/
├── public/
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Root router + auth guard
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # Admin auth state (Context + Provider)
│   │
│   ├── lib/
│   │   ├── supabase.js            # Supabase REST client
│   │   ├── db.js                  # All DB operations (real + demo mode)
│   │   └── scoreUtils.js          # Score calculation helpers
│   │
│   ├── hooks/
│   │   └── useDB.js               # useDB hook (wraps lib/db.js)
│   │
│   ├── styles/
│   │   └── global.css             # All global CSS / cybercore design tokens
│   │
│   ├── components/
│   │   ├── CyberHeader.jsx        # Sticky top nav bar
│   │   ├── CyberField.jsx         # Labeled input / textarea
│   │   ├── SectionHeader.jsx      # Section divider with icon
│   │   ├── RankRow.jsx            # Single row in a leaderboard
│   │   ├── EventCard.jsx          # Event card for View Events page
│   │   ├── TeamCard.jsx           # Team scoring card (Event Round page)
│   │   └── CrosswordFooter.jsx    # Decorative crossword footer
│   │
│   └── pages/
│       ├── SetupPage.jsx          # First-run Supabase config
│       ├── LandingPage.jsx        # Public Women's Day landing page
│       ├── SignInPage.jsx         # Admin login
│       ├── AdminLander.jsx        # Dashboard (Create / View Events)
│       ├── CreateEventPage.jsx    # Multi-step event creation form
│       ├── ViewEventsPage.jsx     # Event list
│       ├── EventRoundPage.jsx     # Live scoring interface
│       ├── RoundStatsPage.jsx     # Per-round leaderboard
│       └── FinalStatsPage.jsx     # Final event leaderboard
│
├── index.html
├── vite.config.js
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

### Dependencies
- react-router-dom v6  (routing)
- react + react-dom    (UI)
- vite                 (build)

## First Run
On first load, a setup screen will ask for your Supabase URL + Anon Key.
Paste the SQL from that screen into your Supabase SQL Editor, then enter
your credentials to initialize the app.

Or click **"Demo Mode"** to run entirely in memory (no Supabase needed).

## Routes

| Route                        | Page              | Protected? |
|------------------------------|-------------------|------------|
| `/`                          | LandingPage       | No         |
| `/signin`                    | SignInPage         | No         |
| `/admin`                     | AdminLander       | Yes        |
| `/admin/create`              | CreateEventPage   | Yes        |
| `/admin/events`              | ViewEventsPage    | Yes        |
| `/admin/events/:eventId/round/:roundIndex` | EventRoundPage | Yes |
| `/admin/events/:eventId/round/:roundIndex/stats` | RoundStatsPage | Yes |
| `/admin/events/:eventId/final` | FinalStatsPage  | Yes        |
