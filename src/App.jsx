/**
 * App.jsx — root component.
 *
 * Responsibilities:
 *  1. One-time Supabase initialisation (reads creds from localStorage).
 *  2. Provide AuthContext to the whole tree.
 *  3. Declare all routes via react-router-dom v6.
 *  4. Protect admin routes with <RequireAuth>.
 *  5. Render the global scan-line overlay.
 *
 * Fix: SetupGuard now holds `configured` in React state (not just reading
 * localStorage at render time), so when SetupPage writes to localStorage
 * and calls navigate("/"), the guard actually re-renders and lets the
 * navigation through instead of blocking it.
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";

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

// ── Supabase init + setup guard ───────────────────────────────────────────────
/**
 * Reads config from localStorage on mount.
 * If not configured → renders SetupPage and passes it an onDone callback.
 * onDone writes to localStorage, inits Supabase, then flips `configured`
 * state to true — which causes this component to re-render and hand off
 * to the real <Outlet /> (the rest of the route tree).
 */
function SetupGuard() {
  const [configured, setConfigured] = useState(() => {
    return Boolean(localStorage.getItem("qf_url"));
  });

  // If already configured on mount, init Supabase right away
  useEffect(() => {
    const url = localStorage.getItem("qf_url");
    const key = localStorage.getItem("qf_key");
    if (url && url !== "DEMO" && key) {
      initSupabase(url, key);
    }
  }, []);

  function handleSetupDone(url, key) {
    localStorage.setItem("qf_url", url);
    localStorage.setItem("qf_key", key);
    if (url !== "DEMO") {
      initSupabase(url, key);
    }
    // Flipping state re-renders SetupGuard → <Outlet /> is now rendered
    // → react-router picks up the pending navigation to "/"
    setConfigured(true);
  }

  if (!configured) {
    return <SetupPage onDone={handleSetupDone} />;
  }

  return <Outlet />;
}

// ── Auth guard ────────────────────────────────────────────────────────────────
/**
 * Wrap protected routes with this.
 * Redirects to /signin if the admin is not authenticated.
 */
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
        <Route element={<SetupGuard />}>

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

        </Route>
      </Routes>
    </AuthProvider>
  );
}