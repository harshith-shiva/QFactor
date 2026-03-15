/**
 * App.jsx — root component.
 *
 * Responsibilities:
 *  1. One-time Supabase initialisation — checks VITE_ env vars first,
 *     falls back to localStorage (manual setup screen) if not present.
 *  2. Provide AuthContext to the whole tree.
 *  3. Declare all routes via react-router-dom v6.
 *  4. Protect admin routes with <RequireAuth>.
 *  5. Render the global scan-line overlay.
 *
 * Priority order for Supabase config:
 *   1. VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env  → used directly, setup screen skipped
 *   2. localStorage "qf_url" / "qf_key"                    → set by the manual SetupPage
 *   3. Neither present                                      → SetupPage shown
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { initSupabase } from "./lib/supabase.js";

// Pages
import SetupPage       from "./pages/SetupPage.jsx";
import LandingPage     from "./pages/LandingPage.jsx";
import SignInPage      from "./pages/SignInPage.jsx";
import AdminLander     from "./pages/AdminLander.jsx";
import CreateEventPage from "./pages/CreateEventPage.jsx";
import ViewEventsPage  from "./pages/ViewEventsPage.jsx";
import EventRoundPage  from "./pages/EventRoundPage.jsx";
import RoundStatsPage  from "./pages/RoundStatsPage.jsx";
import FinalStatsPage  from "./pages/FinalStatsPage.jsx";

// ── Setup + Supabase init guard ───────────────────────────────────────────────
function SetupGuard() {
  // Read env vars — Vite replaces these at build time.
  // They will be empty strings ("") if not set in .env, so we check truthiness.
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasEnv = Boolean(envUrl && envKey);

  const [configured, setConfigured] = useState(() => {
    // If .env vars are present, we're already configured — skip setup screen
    if (hasEnv) return true;
    // Otherwise fall back to whatever was saved manually via SetupPage
    return Boolean(localStorage.getItem("qf_url"));
  });

  useEffect(() => {
    if (hasEnv) {
      // .env takes priority — init Supabase directly, ignore localStorage
      initSupabase(envUrl, envKey);
    } else {
      // Manual setup — read from localStorage
      const url = localStorage.getItem("qf_url");
      const key = localStorage.getItem("qf_key");
      if (url && url !== "DEMO" && key) {
        initSupabase(url, key);
      }
    }
  }, []);

  // Called by SetupPage when the user manually enters credentials or picks demo
  function handleSetupDone(url, key) {
    localStorage.setItem("qf_url", url);
    localStorage.setItem("qf_key", key);
    if (url !== "DEMO") {
      initSupabase(url, key);
    }
    // Flipping state re-renders SetupGuard → <Outlet /> renders
    // → react-router picks up the pending navigation to "/"
    setConfigured(true);
  }

  if (!configured) {
    return <SetupPage onDone={handleSetupDone} />;
  }

  return <Outlet />;
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function RequireAuth() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/signin" replace />;
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      {/* Global scan-line overlay (cybercore aesthetic) */}
      <div className="scan-line" />

      <Routes>
        {/* SetupGuard wraps everything — shows SetupPage until configured */}

          {/* ── Public routes ── */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />

          {/* ── Protected admin routes ── */}
          <Route path="/admin" element={<RequireAuth />}>
            <Route index                                          element={<AdminLander />} />
            <Route path="create"                                  element={<CreateEventPage />} />
            <Route path="events"                                  element={<ViewEventsPage />} />
            <Route path="events/:eventId/round/:roundIndex"       element={<EventRoundPage />} />
            <Route path="events/:eventId/round/:roundIndex/stats" element={<RoundStatsPage />} />
            <Route path="events/:eventId/final"                   element={<FinalStatsPage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  );
}