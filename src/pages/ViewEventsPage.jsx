import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import EventCard from "../components/EventCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useDB } from "../hooks/useDB.js";

export default function ViewEventsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const db = useDB();

  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [confirmId,    setConfirmId]    = useState(null); // id of event pending delete confirm
  const [deletingId,   setDeletingId]   = useState(null); // id currently being deleted

  useEffect(() => {
    setLoading(true);
    setError("");
    db.getEvents()
      .then((ev) => setEvents(ev ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location.key]);

  async function handleCardClick(ev) {
    if (ev.status === "completed") {
      navigate(`/admin/events/${ev.id}/final`);
    } else {
      navigate(`/admin/events/${ev.id}/round/0`);
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmId) return;
    setDeletingId(confirmId);
    setConfirmId(null);
    try {
      await db.deleteEvent(confirmId);
      setEvents((prev) => prev.filter((e) => e.id !== confirmId));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "var(--cyber-bg)" }}>
      <CyberHeader title="EVENT REGISTRY" backTo="/admin" />

      <div className="page-enter" style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <SectionHeader
          title={loading ? "LOADING..." : `${events.length} EVENTS FOUND`}
          icon="◈"
        />

        {error && (
          <div style={{
            color: "var(--cyber-red)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            marginBottom: 20,
            padding: 12,
            background: "rgba(255,0,60,0.05)",
            border: "1px solid rgba(255,0,60,0.2)",
          }}>
            ERROR: {error}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 80,
            color: "var(--cyber-dim)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13,
          }}>
            NO EVENTS FOUND.
            <br /><br />
            <button className="cyber-btn success" onClick={() => navigate("/admin/create")}>
              CREATE YOUR FIRST EVENT
            </button>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onClick={() => handleCardClick(ev)}
              onDelete={() => setConfirmId(ev.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {confirmId && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmId(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            className="cyber-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 32, width: 340, borderRadius: 2 }}
          >
            <div style={{
              fontFamily: "'Orbitron', monospace",
              color: "var(--cyber-red)",
              fontSize: 13,
              letterSpacing: 2,
              marginBottom: 14,
            }}>
              ⚠ DELETE EVENT
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              color: "var(--cyber-dim)",
              marginBottom: 8,
              lineHeight: 1.6,
            }}>
              This will permanently remove
            </div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 12,
              color: "var(--cyber-text)",
              marginBottom: 20,
            }}>
              {events.find((e) => e.id === confirmId)?.name ?? confirmId}
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "var(--cyber-red)",
              marginBottom: 24,
              opacity: 0.7,
            }}>
              All rounds, scores and teams will be lost. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="cyber-btn"
                onClick={() => setConfirmId(null)}
                style={{ flex: 1 }}
              >
                CANCEL
              </button>
              <button
                className="cyber-btn danger"
                onClick={handleDeleteConfirmed}
                style={{
                  flex: 1,
                  borderColor: "var(--cyber-red)",
                  color: "var(--cyber-red)",
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}