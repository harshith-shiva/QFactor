import { useState } from "react";

const SQL_SETUP = `-- Run this in your Supabase SQL Editor first:

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  date_time timestamptz,
  quiz_master text not null,
  quiz_master_email text not null,
  num_rounds int default 1,
  points_system text,
  status text default 'upcoming',
  created_at timestamptz default now()
);

create table if not exists moderators (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  name text,
  email text
);

create table if not exists rounds (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  round_number int,
  name text,
  description text,
  bounce_plus int default 10,
  pounce_plus int default 20,
  pounce_minus int default 5,
  num_questions int default 10,
  status text default 'pending'
);

create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  name text not null,
  lead_name text
);

create table if not exists participants (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade,
  name text,
  student_id text,
  email text,
  phone text
);

create table if not exists scores (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  round_id uuid references rounds(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  question_number int,
  action_type text,
  points int,
  created_at timestamptz default now()
);

-- RLS: allow all for anon key (single-admin app)
alter table events       enable row level security;
alter table moderators   enable row level security;
alter table rounds       enable row level security;
alter table teams        enable row level security;
alter table participants enable row level security;
alter table scores       enable row level security;

create policy "allow_all" on events       for all using (true) with check (true);
create policy "allow_all" on moderators   for all using (true) with check (true);
create policy "allow_all" on rounds       for all using (true) with check (true);
create policy "allow_all" on teams        for all using (true) with check (true);
create policy "allow_all" on participants for all using (true) with check (true);
create policy "allow_all" on scores       for all using (true) with check (true);`;

/**
 * SetupPage — shown on first run when no Supabase config exists.
 *
 * Props:
 *   onDone(url, key) — called when the user submits credentials or
 *                      picks demo mode. App.jsx owns localStorage writes
 *                      and navigation so the SetupGuard state update and
 *                      the route change happen in the same render cycle.
 */
export default function SetupPage({ onDone }) {
  const [url,     setUrl]     = useState("");
  const [key,     setKey]     = useState("");
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--cyber-bg)",
      }}
    >
      <div
        className="cyber-panel page-enter"
        style={{ maxWidth: 600, width: "100%", padding: 32, borderRadius: 4 }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: "'Orbitron', monospace",
            color: "var(--cyber-glow)",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          ⚙ SUPABASE CONFIGURATION
        </div>
        <div
          style={{
            color: "var(--cyber-dim)",
            fontSize: 13,
            marginBottom: 24,
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          Connect your Supabase project to power QFactor's database.
        </div>

        {/* URL */}
        <div style={{ marginBottom: 16 }}>
          <label className="cyber-label">Supabase Project URL</label>
          <input
            className="cyber-input"
            placeholder="https://xxxxxxxx.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {/* Anon Key */}
        <div style={{ marginBottom: 24 }}>
          <label className="cyber-label">Supabase Anon Key</label>
          <input
            className="cyber-input"
            type={showKey ? "text" : "password"}
            placeholder="eyJ..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && url && key && onDone(url, key)}
          />
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "var(--cyber-dim)",
              cursor: "pointer",
              fontFamily: "'Share Tech Mono', monospace",
            }}
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? "▲ Hide key" : "▼ Show key"}
          </div>
        </div>

        {/* SQL */}
        <div
          style={{
            background: "rgba(0,255,65,0.04)",
            border: "1px solid rgba(0,255,65,0.2)",
            padding: 16,
            borderRadius: 2,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 10,
              color: "var(--cyber-green)",
              marginBottom: 8,
            }}
          >
            ▸ REQUIRED SQL SETUP
          </div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>
            Paste this into your Supabase SQL Editor and run it first:
          </div>
          <textarea
            readOnly
            value={SQL_SETUP}
            style={{
              width: "100%",
              height: 140,
              background: "#050a0e",
              border: "1px solid #1a3a2a",
              color: "#00ff41",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              padding: 8,
              resize: "vertical",
            }}
          />
        </div>

        {/* Connect button */}
        <button
          className="cyber-btn success"
          style={{ width: "100%", padding: 14, fontSize: 13 }}
          onClick={() => onDone(url, key)}
          disabled={!url || !key}
        >
          INITIALIZE SYSTEM
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0 16px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--cyber-border)" }} />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "var(--cyber-dim)",
            }}
          >
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--cyber-border)" }} />
        </div>

        {/* Demo mode button — now more visible */}
        <button
          className="cyber-btn purple"
          style={{ width: "100%", padding: 12, fontSize: 11 }}
          onClick={() => onDone("DEMO", "DEMO")}
        >
          ↗ DEMO MODE — run in memory, no Supabase needed
        </button>

        <div
          style={{
            marginTop: 12,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: "var(--cyber-dim)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Demo mode stores data in memory only.
          <br />
          Refreshing the page will reset all data.
        </div>
      </div>
    </div>
  );
}