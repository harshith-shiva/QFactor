import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSignIn() {
    setLoading(true);
    setError("");
    // Small artificial delay for the "authenticating…" UX feel
    setTimeout(() => {
      const ok = signIn(username, password);
      if (ok) {
        navigate("/admin");
      } else {
        setError("INVALID CREDENTIALS — ACCESS DENIED");
      }
      setLoading(false);
    }, 600);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSignIn();
  }

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cyber-bg)",
        position: "relative",
      }}
    >
      {/* Radial glow behind panel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,245,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="cyber-panel page-enter"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 40,
          borderRadius: 2,
          position: "relative",
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: -1, left: -1,
            width: 20, height: 20,
            borderTop: "2px solid var(--cyber-glow)",
            borderLeft: "2px solid var(--cyber-glow)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1, right: -1,
            width: 20, height: 20,
            borderBottom: "2px solid var(--cyber-glow)",
            borderRight: "2px solid var(--cyber-glow)",
          }}
        />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            className="glitch-text"
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 28,
              color: "var(--cyber-glow)",
              fontWeight: 900,
              letterSpacing: 4,
              textShadow: "0 0 20px var(--cyber-glow)",
            }}
          >
            QFACTOR
          </div>
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              color: "var(--cyber-dim)",
              letterSpacing: 3,
              marginTop: 4,
            }}
          >
            ADMIN ACCESS TERMINAL
          </div>
        </div>

        <div
          className="terminal-line"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: "var(--cyber-green)",
            marginBottom: 20,
          }}
        >
          AWAITING AUTHENTICATION...
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 16 }}>
          <label className="cyber-label">USER_ID</label>
          <input
            className="cyber-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="cyber-label">PASS_KEY</label>
          <input
            className="cyber-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(255,0,60,0.08)",
              border: "1px solid rgba(255,0,60,0.3)",
              padding: "10px 14px",
              marginBottom: 16,
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              color: "var(--cyber-red)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⚠</span> {error}
          </div>
        )}

        <button
          className="cyber-btn"
          style={{ width: "100%", padding: 14, fontSize: 13 }}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
        </button>

        <div
          style={{
            marginTop: 20,
            padding: 10,
            background: "rgba(0,255,65,0.03)",
            border: "1px solid rgba(0,255,65,0.1)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: "var(--cyber-dim)",
            textAlign: "center",
          }}
        >
          SINGLE ADMIN SYSTEM · NO REGISTRATION
        </div>
      </div>
    </div>
  );
}
