/**
 * App.jsx — root component.
 *
 * Responsibilities:
 *  1. One-time Supabase initialisation (reads creds from localStorage).
 *  2. Provide AuthContext to the whole tree.
 *  3. Declare all routes via react-router-dom v6.
 *  4. Protect admin routes with <RequireAuth>.
 *  5. Render the global scan-line overlay.
 */

import { useEffect } from "react";
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

// ── Supabase init wrapper ─────────────────────────────────────────────────────
function SupabaseInit({ children }) {
  useEffect(() => {
    const url = localStorage.getItem("qf_url");
    const key = localStorage.getItem("qf_key");
    if (url && url !== "DEMO" && key) {
      initSupabase(url, key);
    }
  }, []);
  return children;
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

// ── Setup guard ───────────────────────────────────────────────────────────────
/**
 * If Supabase has never been configured, show the setup screen first.
 * Otherwise render the app normally.
 */
function SetupGuard() {
  const hasConfig = Boolean(localStorage.getItem("qf_url"));
  if (!hasConfig) return <SetupPage />;
  return <Outlet />;
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <SupabaseInit>
        {/* Global scan-line overlay (cybercore aesthetic) */}
        <div className="scan-line" />

        <Routes>
          {/* ── Setup guard wraps everything ── */}
          <Route element={<SetupGuard />}>

            {/* ── Public routes ── */}
            <Route path="/"       element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />

            {/* ── Protected admin routes ── */}
            <Route path="/admin" element={<RequireAuth />}>
              <Route index                                                   element={<AdminLander />} />
              <Route path="create"                                           element={<CreateEventPage />} />
              <Route path="events"                                           element={<ViewEventsPage />} />
              <Route path="events/:eventId/round/:roundIndex"                element={<EventRoundPage />} />
              <Route path="events/:eventId/round/:roundIndex/stats"          element={<RoundStatsPage />} />
              <Route path="events/:eventId/final"                            element={<FinalStatsPage />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </Routes>
      </SupabaseInit>
    </AuthProvider>
  );
}
