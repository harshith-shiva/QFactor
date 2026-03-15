/**
 * db.js — all data operations in one place.
 *
 * Two implementations live here:
 *   • realDB   — calls the Supabase REST API via lib/supabase.js
 *   • demoDb   — pure in-memory store (no network; great for testing)
 *
 * The app picks one at startup based on whether Supabase is configured.
 * Both expose the exact same function signatures so the rest of the app
 * never needs to care which is in use.
 */

import { dbSelect, dbInsert, dbUpdate, dbDelete } from "./supabase.js";

// ─── REAL SUPABASE DB ─────────────────────────────────────────────────────────

export const realDB = {
  // ── Events ──────────────────────────────────────────────────────────────
  createEvent: async (data) => {
    const rows = await dbInsert("events", { ...data, status: "upcoming" });
    return rows[0];
  },
  getEvents: () => dbSelect("events", "*", "order=created_at.desc"),
  getEvent: (id) => dbSelect("events", "*", `id=eq.${id}`).then((r) => r?.[0]),
  updateEvent: (id, data) => dbUpdate("events", `id=eq.${id}`, data),

  // ── Rounds ──────────────────────────────────────────────────────────────
  createRound: async (data) => {
    const rows = await dbInsert("rounds", data);
    return rows[0];
  },
  getRounds: (eventId) =>
    dbSelect("rounds", "*", `event_id=eq.${eventId}&order=round_number.asc`),
  updateRound: (id, data) => dbUpdate("rounds", `id=eq.${id}`, data),

  // ── Teams ────────────────────────────────────────────────────────────────
  createTeam: async (data) => {
    const rows = await dbInsert("teams", data);
    return rows[0];
  },
  getTeams: (eventId) => dbSelect("teams", "*", `event_id=eq.${eventId}`),

  // ── Participants ─────────────────────────────────────────────────────────
  createParticipant: async (data) => {
    const rows = await dbInsert("participants", data);
    return rows[0];
  },

  // ── Moderators ───────────────────────────────────────────────────────────
  createModerator: async (data) => {
    const rows = await dbInsert("moderators", data);
    return rows[0];
  },

  // ── Scores ───────────────────────────────────────────────────────────────
  addScore: async (data) => {
    const rows = await dbInsert("scores", data);
    return rows[0];
  },
  getScores: (eventId) => dbSelect("scores", "*", `event_id=eq.${eventId}`),

  // NEW — update a single score row (points and/or question_number)
  updateScore: async (id, data) => {
    const rows = await dbUpdate("scores", `id=eq.${id}`, data);
    return rows[0];
  },

  // NEW — delete a single score row
  deleteScore: (id) => dbDelete("scores", `id=eq.${id}`),
};

// ─── IN-MEMORY DEMO DB ────────────────────────────────────────────────────────

let _store = {
  events: [],
  rounds: [],
  teams: [],
  participants: [],
  scores: [],
  moderators: [],
};
let _nextId = 1;

function uid() {
  return String(_nextId++);
}

function demoInsert(table, row) {
  const record = { ...row, id: uid(), created_at: new Date().toISOString() };
  _store[table] = [..._store[table], record];
  return record;
}

function demoFilter(table, filters = {}) {
  return _store[table].filter((r) =>
    Object.entries(filters).every(([k, v]) => r[k] === v)
  );
}

function demoUpdate(table, id, data) {
  _store[table] = _store[table].map((r) =>
    r.id === id ? { ...r, ...data } : r
  );
  return _store[table].find((r) => r.id === id);
}

function demoDelete(table, id) {
  _store[table] = _store[table].filter((r) => r.id !== id);
}

export const demoDb = {
  createEvent: (data) =>
    Promise.resolve(demoInsert("events", { ...data, status: "upcoming" })),
  getEvents: () =>
    Promise.resolve([..._store.events].reverse()),
  getEvent: (id) =>
    Promise.resolve(_store.events.find((e) => e.id === id) ?? null),
  updateEvent: (id, data) =>
    Promise.resolve(demoUpdate("events", id, data)),

  createRound: (data) =>
    Promise.resolve(demoInsert("rounds", data)),
  getRounds: (eventId) =>
    Promise.resolve(
      demoFilter("rounds", { event_id: eventId }).sort(
        (a, b) => a.round_number - b.round_number
      )
    ),
  updateRound: (id, data) =>
    Promise.resolve(demoUpdate("rounds", id, data)),

  createTeam: (data) =>
    Promise.resolve(demoInsert("teams", data)),
  getTeams: (eventId) =>
    Promise.resolve(demoFilter("teams", { event_id: eventId })),

  createParticipant: (data) =>
    Promise.resolve(demoInsert("participants", data)),

  createModerator: (data) =>
    Promise.resolve(demoInsert("moderators", data)),

  addScore: (data) =>
    Promise.resolve(demoInsert("scores", data)),
  getScores: (eventId) =>
    Promise.resolve(demoFilter("scores", { event_id: eventId })),

  // NEW — update a single score row
  updateScore: (id, data) =>
    Promise.resolve(demoUpdate("scores", id, data)),

  // NEW — delete a single score row
  deleteScore: (id) => {
    demoDelete("scores", id);
    return Promise.resolve();
  },
};

/** Reset demo store (useful for tests) */
export function resetDemoStore() {
  _store = { events: [], rounds: [], teams: [], participants: [], scores: [], moderators: [] };
  _nextId = 1;
}