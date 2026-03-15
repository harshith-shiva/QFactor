import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import CyberField from "../components/CyberField.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useDB } from "../hooks/useDB.js";

const STEPS = ["EVENT DETAILS", "ROUND CONFIG", "TEAMS"];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const db = useDB();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Step 0: Event details ──────────────────────────────────────────────────
  const [evName,    setEvName]    = useState("");
  const [evDesc,    setEvDesc]    = useState("");
  const [evDate,    setEvDate]    = useState("");
  const [qmName,    setQmName]    = useState("");
  const [qmEmail,   setQmEmail]   = useState("");
  const [numRounds, setNumRounds] = useState(3);
  const [pointsSys, setPointsSys] = useState("");
  const [mods,      setMods]      = useState([{ name: "", email: "" }]);

  // ── Step 1: Rounds ─────────────────────────────────────────────────────────
  const [rounds, setRounds] = useState([
    { name: "Round 1", desc: "", bounce_plus: 10, pounce_plus: 20, pounce_minus: 5, num_questions: 10 },
  ]);

  // Sync rounds array length when numRounds changes
  useEffect(() => {
    setRounds((prev) => {
      const next = [];
      for (let i = 0; i < numRounds; i++) {
        next.push(
          prev[i] ?? {
            name: `Round ${i + 1}`,
            desc: "",
            bounce_plus: 10,
            pounce_plus: 20,
            pounce_minus: 5,
            num_questions: 10,
          }
        );
      }
      return next;
    });
  }, [numRounds]);

  // ── Step 2: Teams ──────────────────────────────────────────────────────────
  const [teams, setTeams] = useState([
    {
      name: "",
      lead: "",
      participants: [{ name: "", student_id: "", email: "", phone: "" }],
    },
  ]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateRound(idx, field, value) {
    setRounds((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function updateTeam(idx, field, value) {
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  }

  function updateParticipant(teamIdx, pIdx, field, value) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? {
              ...t,
              participants: t.participants.map((p, j) =>
                j === pIdx ? { ...p, [field]: value } : p
              ),
            }
          : t
      )
    );
  }

  function addParticipant(teamIdx) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? { ...t, participants: [...t.participants, { name: "", student_id: "", email: "", phone: "" }] }
          : t
      )
    );
  }

  function removeParticipant(teamIdx, pIdx) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? { ...t, participants: t.participants.filter((_, j) => j !== pIdx) }
          : t
      )
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      // 1. Event
      const ev = await db.createEvent({
        name: evName,
        description: evDesc,
        date_time: evDate || null,
        quiz_master: qmName,
        quiz_master_email: qmEmail,
        num_rounds: numRounds,
        points_system: pointsSys,
      });

      // 2. Moderators
      for (const mod of mods.filter((m) => m.name.trim())) {
        await db.createModerator({ event_id: ev.id, name: mod.name, email: mod.email });
      }

      // 3. Rounds
      for (let i = 0; i < rounds.length; i++) {
        await db.createRound({
          event_id: ev.id,
          round_number: i + 1,
          name: rounds[i].name,
          description: rounds[i].desc,
          bounce_plus: rounds[i].bounce_plus,
          pounce_plus: rounds[i].pounce_plus,
          pounce_minus: rounds[i].pounce_minus,
          num_questions: rounds[i].num_questions,
          status: i === 0 ? "active" : "pending",
        });
      }

      // 4. Teams + participants
      for (const t of teams.filter((t) => t.name.trim())) {
        const team = await db.createTeam({ event_id: ev.id, name: t.name, lead_name: t.lead });
        for (const p of t.participants.filter((p) => p.name.trim())) {
          await db.createParticipant({
            team_id: team.id,
            name: p.name,
            student_id: p.student_id,
            email: p.email,
            phone: p.phone,
          });
        }
      }

      navigate("/admin");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="grid-bg"
      style={{ minHeight: "100vh", background: "var(--cyber-bg)" }}
    >
      <CyberHeader title="CREATE EVENT" backTo="/admin" />

      <div
        className="page-enter"
        style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}
      >
        {/* ── Progress bar ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: 3,
                  background: i <= step ? "var(--cyber-glow)" : "var(--cyber-border)",
                  marginBottom: 6,
                  transition: "background 0.3s",
                }}
              />
              <span
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 9,
                  color: i <= step ? "var(--cyber-glow)" : "var(--cyber-dim)",
                  letterSpacing: 1,
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 0: Event details ── */}
        {step === 0 && (
          <div>
            <SectionHeader title="EVENT DETAILS" icon="◉" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <CyberField label="Event Name *"       value={evName}    onChange={setEvName}    colSpan />
              <CyberField label="Description"        value={evDesc}    onChange={setEvDesc}    colSpan textarea />
              <CyberField label="Date & Time"        value={evDate}    onChange={setEvDate}    type="datetime-local" />
              <CyberField label="Number of Rounds"   value={numRounds} onChange={(v) => setNumRounds(Number(v))} type="number" />
              <CyberField label="Quiz Master Name *" value={qmName}    onChange={setQmName} />
              <CyberField label="Quiz Master Email *" value={qmEmail}  onChange={setQmEmail}  type="email" />
            </div>
            <CyberField label="Points System Description" value={pointsSys} onChange={setPointsSys} textarea />

            <SectionHeader title="MODERATORS" icon="◈" style={{ marginTop: 32 }} />
            {mods.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <CyberField
                  label={`Moderator ${i + 1} Name`}
                  value={m.name}
                  onChange={(v) => setMods(mods.map((x, j) => (j === i ? { ...x, name: v } : x)))}
                />
                <CyberField
                  label="Email (optional)"
                  value={m.email}
                  type="email"
                  onChange={(v) => setMods(mods.map((x, j) => (j === i ? { ...x, email: v } : x)))}
                />
                <button
                  className="cyber-btn danger"
                  style={{ alignSelf: "flex-end", padding: "8px 12px" }}
                  onClick={() => setMods(mods.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="cyber-btn"
              onClick={() => setMods([...mods, { name: "", email: "" }])}
            >
              + ADD MODERATOR
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
              <button
                className="cyber-btn success"
                onClick={() => setStep(1)}
                disabled={!evName || !qmName || !qmEmail}
              >
                NEXT: ROUNDS →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Rounds ── */}
        {step === 1 && (
          <div>
            <SectionHeader title={`ROUND CONFIGURATION (${rounds.length} ROUNDS)`} icon="⊛" />
            {rounds.map((r, i) => (
              <div
                key={i}
                className="cyber-panel"
                style={{ padding: 20, marginBottom: 20, borderRadius: 2 }}
              >
                <div
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 11,
                    color: "var(--cyber-glow)",
                    letterSpacing: 2,
                    marginBottom: 16,
                  }}
                >
                  ROUND {i + 1}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <CyberField label="Round Name"       value={r.name}          onChange={(v) => updateRound(i, "name", v)} />
                  <CyberField label="Num of Questions" value={r.num_questions} onChange={(v) => updateRound(i, "num_questions", Number(v))} type="number" />
                  <CyberField label="Description"      value={r.desc}          onChange={(v) => updateRound(i, "desc", v)} colSpan />
                  <CyberField label="Bounce + Pts"     value={r.bounce_plus}   onChange={(v) => updateRound(i, "bounce_plus", Number(v))}  type="number" />
                  <CyberField label="Pounce + Pts"     value={r.pounce_plus}   onChange={(v) => updateRound(i, "pounce_plus", Number(v))}  type="number" />
                  <CyberField label="Pounce - Pts"     value={r.pounce_minus}  onChange={(v) => updateRound(i, "pounce_minus", Number(v))} type="number" />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button className="cyber-btn" onClick={() => setStep(0)}>← BACK</button>
              <button className="cyber-btn success" onClick={() => setStep(2)}>NEXT: TEAMS →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Teams ── */}
        {step === 2 && (
          <div>
            <SectionHeader title="TEAMS" icon="▲" />
            {teams.map((t, ti) => (
              <div
                key={ti}
                className="cyber-panel"
                style={{ padding: 20, marginBottom: 20, borderRadius: 2 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 11,
                      color: "var(--cyber-glow)",
                      letterSpacing: 2,
                    }}
                  >
                    TEAM {ti + 1}
                  </div>
                  {teams.length > 1 && (
                    <button
                      className="cyber-btn danger"
                      style={{ padding: "4px 10px", fontSize: 9 }}
                      onClick={() => setTeams(teams.filter((_, j) => j !== ti))}
                    >
                      REMOVE
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <CyberField label="Team Name *" value={t.name} onChange={(v) => updateTeam(ti, "name", v)} />
                  <CyberField label="Team Lead"   value={t.lead} onChange={(v) => updateTeam(ti, "lead", v)} />
                </div>

                <div
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 9,
                    color: "var(--cyber-dim)",
                    letterSpacing: 2,
                    marginBottom: 10,
                  }}
                >
                  PARTICIPANTS
                </div>

                {t.participants.map((p, pi) => (
                  <div
                    key={pi}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <CyberField label="Name"       value={p.name}       onChange={(v) => updateParticipant(ti, pi, "name", v)} />
                    <CyberField label="Student ID" value={p.student_id} onChange={(v) => updateParticipant(ti, pi, "student_id", v)} />
                    <CyberField label="Email"      value={p.email}      onChange={(v) => updateParticipant(ti, pi, "email", v)} type="email" />
                    <CyberField label="Phone"      value={p.phone}      onChange={(v) => updateParticipant(ti, pi, "phone", v)} />
                    <button
                      className="cyber-btn danger"
                      style={{ alignSelf: "flex-end", padding: "8px 10px" }}
                      onClick={() => removeParticipant(ti, pi)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  className="cyber-btn"
                  style={{ fontSize: 9 }}
                  onClick={() => addParticipant(ti)}
                >
                  + PARTICIPANT
                </button>
              </div>
            ))}

            <button
              className="cyber-btn purple"
              onClick={() =>
                setTeams([
                  ...teams,
                  {
                    name: "",
                    lead: "",
                    participants: [{ name: "", student_id: "", email: "", phone: "" }],
                  },
                ])
              }
            >
              + ADD TEAM
            </button>

            {error && (
              <div
                style={{
                  color: "var(--cyber-red)",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 11,
                  marginTop: 12,
                  padding: 10,
                  background: "rgba(255,0,60,0.05)",
                  border: "1px solid rgba(255,0,60,0.2)",
                }}
              >
                ERROR: {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <button className="cyber-btn" onClick={() => setStep(1)}>
                ← BACK
              </button>
              <button
                className="cyber-btn success"
                onClick={handleSubmit}
                disabled={loading || !teams.some((t) => t.name.trim())}
              >
                {loading ? "SAVING..." : "SUBMIT & CREATE EVENT ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
