import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initSupabase } from "../lib/supabase.js";

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

export default function SetupPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  function handleInit() {
    if (!url || !key) return;
    localStorage.setItem("qf_url", url);
    localStorage.setItem("qf_key", key);
    initSupabase(url, key);
    navigate("/");
  }

  function handleDemo() {
    localStorage.setItem("qf_url", "DEMO");
    localStorage.setItem("qf_key", "DEMO");
    navigate("/");
  }

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
          />
          <div
            style={{ marginTop: 4, fontSize: 11, color: "var(--cyber-dim)", cursor: "pointer" }}
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
            Paste this into your Supabase SQL Editor and run it:
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

        <button
          className="cyber-btn success"
          style={{ width: "100%", padding: 14, fontSize: 13 }}
          onClick={handleInit}
          disabled={!url || !key}
        >
          INITIALIZE SYSTEM
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            onClick={handleDemo}
            style={{
              background: "none",
              border: "none",
              color: "var(--cyber-dim)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            ↗ SKIP — USE DEMO MODE (in-memory, no Supabase needed)
          </button>
        </div>
      </div>
    </div>
  );
}
