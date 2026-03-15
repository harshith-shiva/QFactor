import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import EventCard from "../components/EventCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useDB } from "../hooks/useDB.js";

export default function ViewEventsPage() {
  const navigate = useNavigate();
  const db = useDB();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    db.getEvents()
      .then((ev) => setEvents(ev ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleCardClick(ev) {
    if (ev.status === "completed") {
      navigate(`/admin/events/${ev.id}/final`);
    } else {
      // Always land on round 0 (index) — EventRoundPage reads rounds from DB
      navigate(`/admin/events/${ev.id}/round/0`);
    }
  }

  return (
    <div
      className="grid-bg"
      style={{ minHeight: "100vh", background: "var(--cyber-bg)" }}
    >
      <CyberHeader title="EVENT REGISTRY" backTo="/admin" />

      <div
        className="page-enter"
        style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}
      >
        <SectionHeader
          title={loading ? "LOADING..." : `${events.length} EVENTS FOUND`}
          icon="◈"
        />

        {error && (
          <div
            style={{
              color: "var(--cyber-red)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              marginBottom: 20,
              padding: 12,
              background: "rgba(255,0,60,0.05)",
              border: "1px solid rgba(255,0,60,0.2)",
            }}
          >
            ERROR: {error}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              color: "var(--cyber-dim)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 13,
            }}
          >
            NO EVENTS FOUND.
            <br />
            <br />
            <button
              className="cyber-btn success"
              onClick={() => navigate("/admin/create")}
            >
              CREATE YOUR FIRST EVENT
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={() => handleCardClick(ev)} />
          ))}
        </div>
      </div>
    </div>
  );
}
