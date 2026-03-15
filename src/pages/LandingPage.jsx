import { useNavigate } from "react-router-dom";
import CrosswordFooter from "../components/CrosswordFooter.jsx";

const PETALS = Array.from({ length: 18 }, (_, i) => i);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── Nav ── */}
      <nav
        style={{
          background: "rgba(10,0,25,0.95)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(180,60,255,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            color: "#f0c0ff",
            letterSpacing: 3,
          }}
        >
          CSA × AMCS{" "}
          <span style={{ color: "#ff99cc", fontStyle: "italic" }}>PSG</span>
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#c090e0",
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          16 · III · 2026
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="wd-hero"
        style={{
          padding: "80px 32px",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Floating petals */}
        {PETALS.map((i) => (
          <div
            key={i}
            className="wd-petal"
            style={{
              left: `${(i * 6.2) % 100}%`,
              top: `${(i * 13.7) % 100}%`,
              width: i % 3 === 0 ? 8 : 5,
              height: i % 3 === 0 ? 8 : 5,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}

        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 760 }}>
          {/* Decorative divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                height: 1,
                width: 80,
                background: "linear-gradient(90deg, transparent, #ff006e)",
              }}
            />
            <span style={{ color: "#ff99cc", fontSize: 24 }}>♀</span>
            <div
              style={{
                height: 1,
                width: 80,
                background: "linear-gradient(90deg, #ff006e, transparent)",
              }}
            />
          </div>

          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 13,
              letterSpacing: 6,
              color: "#c090e0",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Celebrating Women's Day 2026
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 7vw, 72px)",
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 16,
              textShadow: "0 0 40px rgba(255,0,110,0.3)",
            }}
          >
            Women Who{" "}
            <em style={{ color: "#ff99cc", fontStyle: "italic" }}>Shape</em>
            <br />
            The World
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              color: "#d0a0e8",
              lineHeight: 1.7,
              marginBottom: 32,
              fontStyle: "italic",
            }}
          >
            Hosted by the Department of Computer Science &amp; Applications
            <br />
            and the Department of AMCS, PSG College of Technology
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,0,110,0.1)",
              border: "1px solid rgba(255,0,110,0.3)",
              padding: "10px 24px",
              borderRadius: 40,
            }}
          >
            <span style={{ fontSize: 16 }}>📅</span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#ff99cc",
                fontSize: 16,
                letterSpacing: 2,
              }}
            >
              Sunday, 16 March 2026
            </span>
          </div>
        </div>
      </section>

      {/* ── Events Section ── */}
      <section
        style={{
          padding: "60px 32px",
          background: "linear-gradient(180deg, #0d0221 0%, #0a0118 100%)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 13,
                letterSpacing: 6,
                color: "#9060c0",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Events of the Day
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 40,
                color: "#f0d0ff",
              }}
            >
              A Day of{" "}
              <em style={{ color: "#ff99cc", fontStyle: "italic" }}>
                Celebrations
              </em>
            </h2>
          </div>

          {/* Quiz Event Card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(123,47,255,0.12) 0%, rgba(255,0,110,0.08) 100%)",
              border: "1px solid rgba(123,47,255,0.3)",
              borderRadius: 8,
              padding: 40,
              display: "flex",
              alignItems: "center",
              gap: 40,
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(123,47,255,0.15), transparent)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontSize: 60 }}>🧠</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 13,
                  letterSpacing: 4,
                  color: "#9060c0",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Featured Event
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  color: "#f0d0ff",
                  marginBottom: 8,
                }}
              >
                Quiz Competition
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#b090d0",
                  fontSize: 17,
                  lineHeight: 1.6,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                Conducted by Quiz Master{" "}
                <strong style={{ color: "#ff99cc", fontStyle: "normal" }}>
                  Dinesh Veluswamy
                </strong>{" "}
                — test your knowledge, challenge your peers, and claim the crown.
              </p>
              <LaunchButton onClick={() => navigate("/signin")} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <CrosswordFooter />
    </div>
  );
}

function LaunchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #7b2fff, #ff006e)",
        border: "none",
        color: "#fff",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 16,
        letterSpacing: 3,
        padding: "12px 32px",
        cursor: "pointer",
        borderRadius: 2,
        textTransform: "uppercase",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(123,47,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      Launch Quiz App ›
    </button>
  );
}
