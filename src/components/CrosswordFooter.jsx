/**
 * CrosswordFooter — decorative crossword puzzle footer for the Landing Page.
 *
 * Desktop: UFO flies in, beam extends, dev cards revealed top-right. UNCHANGED.
 * Mobile:  No UFO/beam. Dev cards render as plain in-flow section below crossword.
 */
import { useState, useEffect, useRef, useMemo } from 'react';

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRand(42);
const STARS = Array.from({ length: 350 }, (_, i) => ({
  id: i,
  x: rand() * 100,
  y: rand() * 100,
  r: rand() * 0.18 + 0.05,
  opacity: rand() * 0.55 + 0.15,
}));

const ACCENT_STARS = [
  [12, 8,  '#c0a0ff'], [78, 15, '#a0d0ff'], [45, 60, '#ffd0ff'],
  [90, 75, '#a0e8ff'], [5,  82, '#d0c0ff'], [60,  5, '#ffe0c0'],
];

const DEVS = [
  {
    name: 'Harshith Shiva',
    role: 'Frontend Developer',
    github:   'https://github.com/harshith-shiva',
    linkedin: 'https://www.linkedin.com/in/harshith-shiva-3b3b11379?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    color: '#b06aff',
    glow:  'rgba(176,106,255,0.35)',
  },
  {
    name: 'Rajeev',
    role: 'Backend Developer',
    github:   'https://github.com/Rajeev260806',
    linkedin: 'https://www.linkedin.com/in/rajeev-ganesan-1370b7260?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    color: '#60d4ff',
    glow:  'rgba(96,212,255,0.35)',
  },
];

const GH_PATH = "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.3-1.23 3.3-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z";
const LI_PATH = "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.58 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z";

// ── JS breakpoint hook — drives mobile/desktop split in render ───────────────
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return mobile;
}

export default function CrosswordFooter() {
  const isMobile = useIsMobile();

  const [hoveredWordIndex, setHoveredWordIndex] = useState(-1);
  const [ufoPhase, setUfoPhase]         = useState('idle');
  const [beamProgress, setBeamProgress] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const footerRef   = useRef(null);
  const hasAnimated = useRef(false);

  const ROWS = 9, COLS = 12;

  const wordDefs = [
    { word: 'AMCS',     row: 2, col: 3, dir: 'across' },
    { word: 'RAJEEV',   row: 3, col: 5, dir: 'across' },
    { word: 'TECH',     row: 1, col: 0, dir: 'across' },
    { word: 'HARSHITH', row: 1, col: 3, dir: 'down'   },
    { word: 'DINESH',   row: 0, col: 8, dir: 'down'   },
    { word: 'CSA',      row: 1, col: 6, dir: 'down'   },
  ];

  const grid = useMemo(() => {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    wordDefs.forEach(({ word, row, col, dir }) => {
      for (let i = 0; i < word.length; i++) {
        const r = dir === 'down'   ? row + i : row;
        const c = dir === 'across' ? col + i : col;
        if (r < ROWS && c < COLS) g[r][c] = word[i];
      }
    });
    return g;
  }, []);

  const clueNums = { '1-3':1, '0-8':2, '2-3':3, '3-5':4, '1-0':5, '1-6':6 };

  const clues = {
    across: [
      '3. Department acronym? (4)',
      '4. Who did all the backend work? (6)',
      '5. What kind of team built this? (4)',
    ],
    down: [
      '1. Who is the best frontend developer? (8)',
      '2. Who conducts the quiz? (6)',
      '6. Who organised the event? (3)',
    ],
  };

  // UFO sequence only fires on desktop
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        obs.disconnect();
        // Guard: only run UFO on desktop
        if (window.innerWidth >= 768) runUfoSequence();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function runUfoSequence() {
    setUfoPhase('flying');
    setTimeout(() => setUfoPhase('hovering'), 2400);
    setTimeout(() => {
      setUfoPhase('beaming');
      let prog = 0;
      const iv = setInterval(() => {
        prog += 2;
        setBeamProgress(Math.min(prog, 100));
        if (prog >= 100) {
          clearInterval(iv);
          setTimeout(() => setCardsVisible(true), 150);
          setTimeout(() => setUfoPhase('revealed'), 350);
        }
      }, 28);
    }, 3200);
  }

  const ufoActive = ufoPhase !== 'idle';

  function linkHover(color) {
    return {
      onMouseEnter: e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color + '99'; },
      onMouseLeave: e => { e.currentTarget.style.color = '#777'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'; },
    };
  }

  return (
    <footer
      ref={footerRef}
      style={{
        position: 'relative',
        background: '#060310',
        borderTop: '1px solid rgba(180,60,255,0.22)',
        padding: '56px 32px 36px',
        overflow: 'hidden',
      }}
    >
      {/* ── Keyframes + desktop UFO classes — untouched ── */}
      <style>{`
        @keyframes cf-twinkle {
          0%,100% { opacity: var(--op); transform: scale(1); }
          50%      { opacity: 0.04; transform: scale(0.5); }
        }
        @keyframes cf-ufo-in {
          0%   { transform: translate(220px,-140px) scale(0.06); opacity:0; }
          25%  { opacity:1; }
          85%  { transform: translate(0,0) scale(1.06); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes cf-hover {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes cf-beam-pulse {
          0%,100% { opacity:0.5; }
          50%     { opacity:0.9; }
        }
        @keyframes cf-card-in {
          0%   { opacity:0; transform:translateY(20px) scale(0.9); }
          65%  { transform:translateY(-3px) scale(1.02); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes cf-card-glow {
          0%,100% { box-shadow: 0 0 14px var(--cg), 0 0 0 1px var(--cb); }
          50%     { box-shadow: 0 0 30px var(--cg), 0 0 0 1px var(--cb); }
        }
        @keyframes cf-blink {
          0%,88%,100% { opacity:1; } 44%,56% { opacity:0.15; }
        }
        .cf-ufo { position:absolute; top:22px; right:44px; width:118px; z-index:10; }
        .cf-ufo.flying   { animation: cf-ufo-in 2.4s cubic-bezier(.2,.7,0,1.35) forwards; }
        .cf-ufo.hovering,
        .cf-ufo.beaming  { animation: cf-hover 2.6s ease-in-out infinite; }
        .cf-ufo.revealed { animation: cf-hover 3.4s ease-in-out infinite; }
        .cf-card {
          animation: cf-card-in 0.5s cubic-bezier(.22,.68,0,1.3) forwards,
                     cf-card-glow 3s ease-in-out infinite 0.5s;
        }
      `}</style>

      {/* ── Starfield SVG ── */}
      <svg
        aria-hidden="true"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 100 100"
      >
        {STARS.map(s => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
        ))}
        {ACCENT_STARS.map(([x, y, fill], i) => (
          <circle key={`a${i}`} cx={x} cy={y} r={0.22} fill={fill} opacity={0.6} />
        ))}
      </svg>

      {/* ── Desktop only: UFO ── */}
      {!isMobile && ufoActive && (
        <div className={`cf-ufo ${ufoPhase}`}>
          <svg viewBox="0 0 118 76" width="118" height="76" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="cf-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="cf-soft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.8"/>
              </filter>
              <radialGradient id="cf-dome" cx="50%" cy="65%" r="55%">
                <stop offset="0%"   stopColor="#d0b0ff" stopOpacity="0.92"/>
                <stop offset="100%" stopColor="#3310aa" stopOpacity="0.55"/>
              </radialGradient>
              <radialGradient id="cf-body" cx="50%" cy="38%" r="55%">
                <stop offset="0%"   stopColor="#b8c4d8"/>
                <stop offset="100%" stopColor="#334455"/>
              </radialGradient>
              <linearGradient id="cf-beam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#c0eeff" stopOpacity="0.95"/>
                <stop offset="100%" stopColor="#5555ff" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {(ufoPhase === 'beaming' || ufoPhase === 'revealed') && (
              <g style={{ animation: 'cf-beam-pulse 1.4s ease-in-out infinite' }}>
                <polygon points="44,50 74,50 94,76 24,76"
                  fill="url(#cf-beam)" opacity="0.42"
                  style={{ clipPath:`inset(0 0 ${100 - beamProgress}% 0)` }} />
                <polygon points="44,50 74,50 94,76 24,76"
                  fill="url(#cf-beam)" opacity="0.18"
                  filter="url(#cf-soft)"
                  style={{ clipPath:`inset(0 0 ${100 - beamProgress}% 0)` }} />
              </g>
            )}

            <ellipse cx="59" cy="46" rx="42" ry="11" fill="url(#cf-body)" filter="url(#cf-glow)"/>
            <ellipse cx="59" cy="44" rx="42" ry="9.5" fill="#7a8fa0"/>
            <ellipse cx="59" cy="43" rx="40" ry="8"   fill="#9db0c0"/>
            <ellipse cx="59" cy="43" rx="40" ry="8" fill="none" stroke="#cce0f0" strokeWidth="0.9" opacity="0.5"/>

            {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const colors = ['#ff7755','#44ffcc','#ffee44','#ff88cc','#44ddff'];
              return (
                <circle key={i}
                  cx={59 + 37 * Math.cos(rad)} cy={46 + 9 * Math.sin(rad)} r={2.1}
                  fill={colors[i % colors.length]}
                  style={{ animation:`cf-blink ${0.7+i*0.13}s ${i*0.09}s ease-in-out infinite` }} />
              );
            })}

            <ellipse cx="59" cy="38" rx="20" ry="16" fill="url(#cf-dome)" opacity="0.88"/>
            <ellipse cx="59" cy="38" rx="20" ry="16" fill="none" stroke="#c090ff" strokeWidth="0.9" opacity="0.65"/>
            <ellipse cx="52" cy="31" rx="7" ry="4.5" fill="white" opacity="0.16"/>
            <ellipse cx="59" cy="40" rx="12" ry="9" fill="#9060ff" opacity="0.12"/>
          </svg>
        </div>
      )}

      {/* ── Desktop only: dev cards revealed by beam ── */}
      {!isMobile && cardsVisible && (
        <div style={{
          position: 'absolute',
          top: 80,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 9,
          width: 188,
          marginTop: '50px',
        }}>
          {DEVS.map((dev, i) => (
            <div
              key={dev.name}
              className="cf-card"
              style={{
                '--cg': dev.glow,
                '--cb': dev.color + '44',
                animationDelay: `${i * 0.2}s`,
                background: 'rgba(8,4,20,0.93)',
                border: `1px solid ${dev.color}40`,
                borderRadius: 7,
                padding: '10px 13px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontFamily:"'Orbitron', monospace", fontSize:10, color:dev.color, letterSpacing:1, marginBottom:2 }}>
                {dev.name}
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:11, color:'#8070a0', fontStyle:'italic', marginBottom:9 }}>
                {dev.role}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[
                  { label:'GitHub',   href: dev.github,   icon: GH_PATH },
                  { label:'LinkedIn', href: dev.linkedin, icon: LI_PATH },
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    {...linkHover(dev.color)}
                    style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, fontFamily:"'Orbitron', monospace", color:'#777', textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:3, padding:'3px 7px', transition:'color 0.2s, border-color 0.2s' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d={icon}/></svg>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign:'center', marginBottom:6 }}>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:13, letterSpacing:4, color:'#604080', textTransform:'uppercase' }}>
            Built by CSA Tech Team
          </span>
        </div>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:22, color:'#c090e0', fontStyle:'italic' }}>
            Meet the Team — Crossword Edition
          </span>
        </div>

        {/* Grid + Clues */}
        <div style={{ display:'flex', gap:40, flexWrap:'wrap', justifyContent:'center', alignItems:'flex-start' }}>
          <table className="crossword-grid" style={{ borderCollapse:'collapse' }}>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const num = clueNums[`${ri}-${ci}`];
                    const hw  = hoveredWordIndex >= 0 ? wordDefs[hoveredWordIndex] : null;
                    const lit = hw && (() => {
                      const { row: wr, col: wc, word, dir } = hw;
                      if (dir === 'across') return ri === wr && ci >= wc && ci < wc + word.length;
                      return ci === wc && ri >= wr && ri < wr + word.length;
                    })();
                    return (
                      <td key={ci} className={`${cell ? 'filled' : 'black'} ${lit ? 'highlighted' : ''}`}>
                        {num && <span className="clue-num">{num}</span>}
                        {cell ?? ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ minWidth:220 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Orbitron', monospace", fontSize:10, color:'#c090e0', letterSpacing:2, marginBottom:8, textTransform:'uppercase' }}>Across</div>
              {clues.across.map((c, i) => (
                <div key={i}
                  onMouseEnter={() => setHoveredWordIndex(i)}
                  onMouseLeave={() => setHoveredWordIndex(-1)}
                  style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:14, color: hoveredWordIndex === i ? '#c090e0' : '#9070b0', marginBottom:6, lineHeight:1.4, cursor:'pointer', transition:'color 0.15s' }}>
                  {c}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron', monospace", fontSize:10, color:'#c090e0', letterSpacing:2, marginBottom:8, textTransform:'uppercase' }}>Down</div>
              {clues.down.map((c, i) => (
                <div key={i}
                  onMouseEnter={() => setHoveredWordIndex(3 + i)}
                  onMouseLeave={() => setHoveredWordIndex(-1)}
                  style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:14, color: hoveredWordIndex === 3 + i ? '#c090e0' : '#9070b0', marginBottom:6, lineHeight:1.4, cursor:'pointer', transition:'color 0.15s' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile only: dev cards as in-flow section below crossword ── */}
        {isMobile && (
          <div style={{ marginTop: 36 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <div style={{ height:1, flex:1, background:'rgba(100,50,150,0.3)' }} />
              <span style={{ fontFamily:"'Orbitron', monospace", fontSize:9, color:'#604080', letterSpacing:3, textTransform:'uppercase', whiteSpace:'nowrap' }}>
                ✦ The Builders
              </span>
              <div style={{ height:1, flex:1, background:'rgba(100,50,150,0.3)' }} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {DEVS.map((dev) => (
                <div key={dev.name} style={{
                  background: 'rgba(8,4,20,0.93)',
                  border: `1px solid ${dev.color}40`,
                  borderRadius: 7,
                  padding: '12px 14px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ fontFamily:"'Orbitron', monospace", fontSize:10, color:dev.color, letterSpacing:1, marginBottom:2 }}>
                    {dev.name}
                  </div>
                  <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:11, color:'#8070a0', fontStyle:'italic', marginBottom:9 }}>
                    {dev.role}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[
                      { label:'GitHub',   href: dev.github,   icon: GH_PATH },
                      { label:'LinkedIn', href: dev.linkedin, icon: LI_PATH },
                    ].map(({ label, href, icon }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        {...linkHover(dev.color)}
                        style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, fontFamily:"'Orbitron', monospace", color:'#777', textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:3, padding:'3px 7px', transition:'color 0.2s, border-color 0.2s' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d={icon}/></svg>
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:32, paddingTop:20, borderTop:'1px solid rgba(100,50,150,0.2)' }}>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", color:'#604080', fontSize:13, letterSpacing:2 }}>
            © 2026 CSA Tech Team · PSG College of Technology · Women's Day Celebration
          </span>
        </div>
      </div>
    </footer>
  );
}