/**
 * Lightweight Supabase REST client.
 * We avoid the @supabase/supabase-js SDK intentionally to keep
 * the bundle small and have full control over every request.
 */

let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";

/** Call once at startup (SetupPage / App.jsx) */
export function initSupabase(url, key) {
  SUPABASE_URL = url;
  SUPABASE_ANON_KEY = key;
}

async function request(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=representation",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error [${res.status}]: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** SELECT — returns array */
export const dbSelect = (table, query = "*", filters = "") =>
  request(`${table}?select=${query}${filters ? "&" + filters : ""}`, { method: "GET" });

/** INSERT — returns inserted rows */
export const dbInsert = (table, body) =>
  request(table, { method: "POST", body: JSON.stringify(body) });

/** PATCH — returns updated rows */
export const dbUpdate = (table, filter, body) =>
  request(`${table}?${filter}`, { method: "PATCH", body: JSON.stringify(body) });

/** DELETE */
export const dbDelete = (table, filter) =>
  request(`${table}?${filter}`, { method: "DELETE" });
