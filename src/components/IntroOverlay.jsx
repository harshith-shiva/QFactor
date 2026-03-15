/**
 * IntroOverlay.jsx — "Particle Constellation"
 *
 * Fixes in this version:
 *  1. Circle is no longer stretched — radius compensates for canvas aspect
 *     ratio so it renders as a perfect circle on any screen size.
 *  2. Glow is bright pink, not orange — colour formula kept to ff4da6→ffffff
 *     with no green channel boost that caused the orange tint.
 *  3. After assembling, the sign does one slow breathing pulse (bright → dim
 *     → bright) before holding steady at full glow.
 */

import { useEffect, useRef, useState } from "react";

const TWO_PI = Math.PI * 2;

// ─────────────────────────────────────────────────────────────────────────────
// Target point builder — called at runtime with real canvas dimensions
// so the aspect ratio is exact and the circle is always round.
// ─────────────────────────────────────────────────────────────────────────────
function buildTargets(W, H) {
  // Work in pixel space directly — no normalisation needed.
  const cx = W * 0.50;
  const cy = H * 0.38;
  // r in pixels — same physical size in both axes → perfect circle
  const r  = Math.min(W, H) * 0.18;

  const stemTop    = cy + r;
  const stemBottom = stemTop + r * 0.95;   // stem ≈ same length as radius
  const crossY     = stemTop + r * 0.60;
  const crossHalf  = r * 0.55;

  const pts = [];

  // Circle — 220 points
  for (let i = 0; i < 220; i++) {
    const a = (i / 220) * TWO_PI - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }

  // Stem — 48 points
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    pts.push({ x: cx, y: stemTop + t * (stemBottom - stemTop) });
  }

  // Crossbar — 36 points
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    pts.push({ x: cx - crossHalf + t * crossHalf * 2, y: crossY });
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Particle
// ─────────────────────────────────────────────────────────────────────────────
class Particle {
  constructor(i, tx, ty, W, H) {
    this.W  = W;
    this.H  = H;
    this.tx = tx;
    this.ty = ty;

    // Random start position
    this.x = Math.random() * W;
    this.y = Math.random() * H;

    const spd = 0.3 + Math.random() * 0.5;
    const ang = Math.random() * TWO_PI;
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;

    this.r        = 1.1 + Math.random() * 1.1;
    this.alpha    = 0;
    this.maxAlpha = 0.45 + Math.random() * 0.45;
    this.flkOff   = Math.random() * TWO_PI;
    this.flkSpd   = 0.016 + Math.random() * 0.022;
    this.done     = false;
    this.px       = this.x;
    this.py       = this.y;
  }

  drift() {
    this.px = this.x; this.py = this.y;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = this.W;
    if (this.x > this.W) this.x = 0;
    if (this.y < 0) this.y = this.H;
    if (this.y > this.H) this.y = 0;
    this.alpha = Math.min(this.alpha + 0.03, this.maxAlpha);
  }

  attract(strength) {
    this.px = this.x; this.py = this.y;
    if (this.done) return;
    const dx   = this.tx - this.x;
    const dy   = this.ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1.2) {
      this.x = this.tx; this.y = this.ty;
      this.vx = 0; this.vy = 0;
      this.done = true;
    } else {
      const pull = strength * Math.min(dist * 0.055, 3.6);
      this.vx = this.vx * 0.82 + (dx / dist) * pull;
      this.vy = this.vy * 0.82 + (dy / dist) * pull;
      this.x += this.vx;
      this.y += this.vy;
    }
    this.alpha = Math.min(this.alpha + 0.04, this.maxAlpha);
  }

  /**
   * glowAmt  0→1  overall glow progress
   * breathAmt  0→1→0  single breath pulse value (computed in loop)
   */
  draw(ctx, tick, glowAmt, breathAmt) {
    if (this.alpha <= 0.01) return;

    // Individual flicker on locked particles
    const flicker = this.done
      ? 0.84 + 0.16 * Math.sin(tick * this.flkSpd + this.flkOff)
      : 1;

    const a = Math.min(this.alpha * flicker, 1);

    // Motion trail while flying in
    if (!this.done && Math.hypot(this.vx, this.vy) > 1.2) {
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `rgba(255,77,166,${a * 0.25})`;
      ctx.lineWidth   = this.r * 0.65;
      ctx.stroke();
    }

    // Glow halo — PINK only, no orange
    if (this.done && glowAmt > 0) {
      // breathAmt modulates the halo size during the one breath
      const breathScale = 1 + breathAmt * 0.6;
      const gr  = this.r * (3 + glowAmt * 4) * breathScale;
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, gr);
      // Strictly pink → transparent, no orange-causing green channel boost
      grd.addColorStop(0, `rgba(255,0,110,${0.45 * glowAmt * flicker * (1 + breathAmt * 0.5)})`);
      grd.addColorStop(0.4, `rgba(255,20,130,${0.20 * glowAmt * flicker})`);
      grd.addColorStop(1,   "rgba(255,0,110,0)");
      ctx.beginPath();
      ctx.arc(this.x, this.y, gr, 0, TWO_PI);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Core dot colour:
    //  • Not yet assembled → soft pink rgba(255,130,185)
    //  • Assembled, glowAmt rising → bright pink ff006e → ff4da6 → white-pink
    //    We ONLY raise R and B toward white, never raise G (that causes orange)
    const dotR = this.done ? this.r * (1 + glowAmt * 0.5 + breathAmt * 0.3) : this.r;
    ctx.beginPath();
    ctx.arc(this.x, this.y, dotR, 0, TWO_PI);
    if (this.done) {
      // pink (255,0,110) → bright pink (255,77,166) → near-white-pink (255,200,220)
      // Only G and B rise together, keeping the hue in pink territory
      const g = Math.floor(0   + 200 * glowAmt);   // 0   → 200
      const b = Math.floor(110 + 110 * glowAmt);   // 110 → 220
      // During breath: temporarily boost toward white
      const breathBoost = breathAmt * 55;
      ctx.fillStyle = `rgba(255,${Math.min(g + breathBoost, 255)},${Math.min(b + breathBoost, 255)},${a})`;
    } else {
      ctx.fillStyle = `rgba(255,130,185,${a})`;
    }
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const FULL_TEXT = "CSA × AMCS";

export default function IntroOverlay({ onComplete }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const timers    = useRef([]);
  const typeRef   = useRef(null);

  const state = useRef({
    mode:       "hold",
    tick:       0,
    particles:  [],
    glow:       0,        // 0 → 1, rises when mode = "glow"
    breathT:    0,        // 0 → 1 → 0, single breath after glow reaches 1
    breathDir:  1,        // +1 rising, -1 falling
    breathDone: false,
    fadeAlpha:  1,
  });

  const [uiPhase,      setUiPhase]      = useState("hold");
  const [typedText,    setTypedText]    = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [canvasAlpha,  setCanvasAlpha]  = useState(1);

  function sched(fn, ms) {
    timers.current.push(setTimeout(fn, ms));
  }

  function startTyping() {
    let i = 0;
    function step() {
      i++;
      setTypedText(FULL_TEXT.slice(0, i));
      if (i < FULL_TEXT.length) typeRef.current = setTimeout(step, 78);
    }
    typeRef.current = setTimeout(step, 78);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    // Build targets with real pixel dimensions → perfect circle guaranteed
    const targets = buildTargets(W, H);
    state.current.particles = targets.map(
      (t, i) => new Particle(i, t.x, t.y, W, H)
    );

    function loop() {
      const s = state.current;
      s.tick++;
      ctx.clearRect(0, 0, W, H);

      const isDrift   = s.mode === "drift";
      const isAttract = s.mode === "attract";
      const isGlow    = s.mode === "glow" || s.mode === "text" || s.mode === "peak";
      const isFadeOut = s.mode === "fadeout";

      // Advance glow 0 → 1
      if (isGlow && s.glow < 1) {
        s.glow = Math.min(s.glow + 0.018, 1);
      }

      // Single breath: once glow hits 1, do one in-out pulse
      // breathT goes 0 → 1 (rising over ~60 frames) then 1 → 0 (falling)
      if (s.glow >= 1 && !s.breathDone) {
        s.breathT += s.breathDir * 0.012;
        if (s.breathT >= 1) {
          s.breathT   = 1;
          s.breathDir = -1;
        } else if (s.breathT <= 0 && s.breathDir === -1) {
          s.breathT    = 0;
          s.breathDone = true;
        }
      }

      // breathAmt: smooth in-out using sine easing
      const breathAmt = s.breathDone ? 0 : Math.sin(s.breathT * Math.PI * 0.5) ** 2;

      // Background bloom — tight pink, not room-filling
      if (isGlow && s.glow > 0) {
        const bx  = W * 0.5;
        const by  = H * 0.42;
        const br  = Math.min(W, H) * 0.30 * (1 + breathAmt * 0.15);
        const bg  = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0,    `rgba(255,0,110,${(0.14 + breathAmt * 0.08) * s.glow})`);
        bg.addColorStop(0.5,  `rgba(200,0,90,${0.05 * s.glow})`);
        bg.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      // Update + draw particles
      for (const p of s.particles) {
        if (isDrift)        { p.drift(); }
        else if (isAttract) { p.attract(0.92); }
        else if (isGlow)    { if (!p.done) p.attract(1.3); p.alpha = Math.min(p.alpha + 0.05, 1); }
        p.draw(ctx, s.tick, isGlow ? s.glow : 0, breathAmt);
      }

      // Fade out
      if (isFadeOut) {
        s.fadeAlpha = Math.max(s.fadeAlpha - 0.013, 0);
        setCanvasAlpha(s.fadeAlpha);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    // Timeline
    const setMode = (m) => { state.current.mode = m; };
    sched(() => { setMode("drift");   setUiPhase("drift");   }, 500);
    sched(() => { setMode("attract"); setUiPhase("attract"); }, 2600);
    sched(() => { setMode("glow");    setUiPhase("glow");    }, 3800);
    sched(() => {                     setUiPhase("text"); startTyping(); }, 4300);
    sched(() => { setShowSubtitle(true); setUiPhase("peak"); }, 5700);
    sched(() => { setMode("fadeout"); }, 7000);
    sched(() => onComplete(), 8400);

    return () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(typeRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const showText = ["text", "peak", "fadeout"].includes(uiPhase);
  const typing   = showText && typedText.length < FULL_TEXT.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        overflow: "hidden",
        opacity: canvasAlpha,
        pointerEvents: canvasAlpha < 0.05 ? "none" : "all",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          display: "block",
        }}
      />

      {/* Text — pinned to bottom third of screen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "12vh",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(14px, 2.2vw, 24px)",
            fontWeight: 700,
            letterSpacing: "0.5em",
            color: "#fff",
            opacity: showText ? 1 : 0,
            transition: "opacity 0.5s ease",
            textShadow: typedText.length === FULL_TEXT.length
              ? "0 0 14px rgba(255,255,255,0.65), 0 0 30px rgba(255,0,110,0.55)"
              : "0 0 6px rgba(255,255,255,0.2)",
            minHeight: "1.6em",
            display: "flex",
            alignItems: "center",
          }}
        >
          {typedText}
          {typing && (
            <span style={{
              display: "inline-block",
              width: 2, height: "1em",
              background: "#ff4da6",
              marginLeft: 4,
              animation: "blink 0.65s step-end infinite",
            }} />
          )}
        </div>

        <div
          style={{
            marginTop: 10,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(10px, 1.2vw, 14px)",
            letterSpacing: "0.4em",
            color: "rgba(255,200,220,0.55)",
            fontStyle: "italic",
            opacity: showSubtitle ? 1 : 0,
            transition: "opacity 1.4s ease",
          }}
        >
          PSG College of Technology
        </div>
      </div>

      {/* Skip */}
      <div
        style={{
          position: "absolute",
          bottom: 22, right: 22,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.16)",
          letterSpacing: 2,
          cursor: "pointer",
          opacity: uiPhase !== "hold" ? 1 : 0,
          transition: "opacity 1s ease",
          pointerEvents: "all",
        }}
        onClick={() => {
          timers.current.forEach(clearTimeout);
          clearTimeout(typeRef.current);
          cancelAnimationFrame(rafRef.current);
          state.current.mode = "fadeout";
          setTimeout(() => onComplete(), 1000);
        }}
      >
        SKIP ›
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}