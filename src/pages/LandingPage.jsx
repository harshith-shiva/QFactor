import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CrosswordFooter from "../components/CrosswordFooter.jsx";
import IntroOverlay from "../components/IntroOverlay.jsx";

const PETALS = Array.from({ length: 18 }, (_, i) => i);

const KEYFRAMES = `
@keyframes wdFadeInUp {
  0%   { opacity: 0; transform: translateY(55px) scale(0.97); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: translateY(0px) scale(1); }
}
@keyframes wdFadeIn {
  0%   { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
`;

function injectKeyframes() {
  if (!document.getElementById("wd-fade-kf")) {
    const s = document.createElement("style");
    s.id = "wd-fade-kf";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }
}

function loadFadeStyle(ready, delay = 0, mode = "up") {
  if (!ready) return { opacity: 0 };
  return {
    opacity: 0,
    animation: `${mode === "up" ? "wdFadeInUp" : "wdFadeIn"} 1s cubic-bezier(0.22,1,0.36,1) forwards`,
    animationDelay: `${delay}ms`,
  };
}

function useScrollFade() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

function scrollFadeStyle(visible, delay = 0, mode = "up") {
  if (!visible) return {
    opacity: 0,
    transform: mode === "up" ? "translateY(55px) scale(0.97)" : "scale(0.95)",
  };
  return {
    opacity: 0,
    animation: `${mode === "up" ? "wdFadeInUp" : "wdFadeIn"} 1s cubic-bezier(0.22,1,0.36,1) forwards`,
    animationDelay: `${delay}ms`,
  };
}

function ScrollFade({ delay = 0, mode = "up", as: Tag = "div", style: s = {}, children, ...rest }) {
  const [ref, visible] = useScrollFade();
  return (
    <Tag ref={ref} style={{ ...s, ...scrollFadeStyle(visible, delay, mode) }} {...rest}>
      {children}
    </Tag>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => { injectKeyframes(); }, []);

  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem("qf_intro_seen")
  );
  const [heroReady, setHeroReady] = useState(
    () => !!sessionStorage.getItem("qf_intro_seen")
  );

  const heroRef   = useRef(null);
  const eventsRef = useRef(null);
  const footerRef = useRef(null);

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleIntroDone() {
    sessionStorage.setItem("qf_intro_seen", "1");
    setShowIntro(false);
    setTimeout(() => setHeroReady(true), 300);
  }

  return (
    <>
      {showIntro && <IntroOverlay onComplete={handleIntroDone} />}

      <div style={{ transition: "opacity 0.8s ease 0.2s", opacity: showIntro ? 0 : 1 }}>

        {/* ══ Nav ════════════════════════════════════════════════ */}
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
          {/* Brand */}
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              color: "#f0c0ff",
              letterSpacing: 3,
              ...loadFadeStyle(heroReady, 0),
            }}
          >
            CSA × AMCS{" "}
            <span style={{ color: "#ff99cc", fontStyle: "italic" }}>PSG</span>
          </div>

          {/* Nav buttons + Date — right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, ...loadFadeStyle(heroReady, 200) }}>
            {[
              { label: "Home",     ref: heroRef },
              { label: "Event",    ref: eventsRef },
              { label: "About Us", ref: footerRef },
            ].map(({ label, ref }) => (
              <button
                key={label}
                onClick={() => scrollTo(ref)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 15,
                  letterSpacing: 3,
                  color: "#c090e0",
                  textTransform: "uppercase",
                  padding: 0,
                }}
              >
                {label}
              </button>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "rgba(180,60,255,0.3)" }} />

            {/* Date */}
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
          </div>
        </nav>

        {/* ══ Hero ═══════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="wd-hero"
          style={{
            padding: "80px 32px",
            minHeight: "85vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            scrollMarginTop: 64,
          }}
        >
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                marginBottom: 24,
                ...loadFadeStyle(heroReady, 100, "fadeIn"),
              }}
            >
              <div style={{ height: 1, width: 80, background: "linear-gradient(90deg, transparent, #ff006e)" }} />
              <span style={{ color: "#ff99cc", fontSize: 24 }}>♀</span>
              <div style={{ height: 1, width: 80, background: "linear-gradient(90deg, #ff006e, transparent)" }} />
            </div>

            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 13,
                letterSpacing: 6,
                color: "#c090e0",
                textTransform: "uppercase",
                marginBottom: 16,
                ...loadFadeStyle(heroReady, 250),
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
                ...loadFadeStyle(heroReady, 450),
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
                ...loadFadeStyle(heroReady, 650),
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
                ...loadFadeStyle(heroReady, 850),
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
                Tuesday, 18 March 2026
              </span>
            </div>
          </div>
        </section>

        {/* ══ Events Section ═════════════════════════════════════ */}
        <section
          ref={eventsRef}
          style={{
            padding: "60px 32px",
            background: "linear-gradient(180deg, #0d0221 0%, #0a0118 100%)",
            scrollMarginTop: 64,
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ScrollFade
                delay={0}
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
              </ScrollFade>

              <ScrollFade
                as="h2"
                delay={200}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 40,
                  color: "#f0d0ff",
                }}
              >
                A Day of{" "}
                <em style={{ color: "#ff99cc", fontStyle: "italic" }}>Celebrations</em>
              </ScrollFade>
            </div>

            <ScrollFade
              delay={100}
              style={{
                background: "linear-gradient(135deg, rgba(123,47,255,0.12) 0%, rgba(255,0,110,0.08) 100%)",
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
                  top: -30, right: -30,
                  width: 160, height: 160,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(123,47,255,0.15), transparent)",
                  pointerEvents: "none",
                }}
              />

              <ScrollFade delay={250} style={{ fontSize: 60 }}>🧠</ScrollFade>

              <div style={{ flex: 1, minWidth: 200 }}>
                <ScrollFade
                  delay={350}
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
                </ScrollFade>

                <ScrollFade
                  as="h3"
                  delay={480}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 32,
                    color: "#f0d0ff",
                    marginBottom: 8,
                  }}
                >
                  Quiz Competition
                </ScrollFade>

                <ScrollFade
                  as="p"
                  delay={620}
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
                </ScrollFade>

                <ScrollFade delay={780}>
                  <LaunchButton onClick={() => navigate("/signin")} />
                </ScrollFade>
              </div>
            </ScrollFade>
          </div>
        </section>

        {/* ══ Footer / About Us ══════════════════════════════════ */}
        <div ref={footerRef} style={{ scrollMarginTop: 64 }}>
          <ScrollFade delay={0}>
            <CrosswordFooter />
          </ScrollFade>
        </div>

      </div>
    </>
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
      Admin Portal ›
    </button>
  );
}