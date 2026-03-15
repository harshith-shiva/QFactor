/**
 * useDB — returns the active database implementation.
 *
 * The hook reads which mode is active from localStorage
 * (set by SetupPage) and returns either realDB or demoDb.
 *
 * Both objects expose the exact same API so callers are agnostic.
 */

import { useMemo } from "react";
import { realDB, demoDb } from "../lib/db.js";

export function useDB() {
  const isDemo = localStorage.getItem("qf_url") === "DEMO";
  // useMemo so the reference is stable across renders
  return useMemo(() => (isDemo ? demoDb : realDB), [isDemo]);
}
