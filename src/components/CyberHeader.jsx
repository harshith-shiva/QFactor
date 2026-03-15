import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * CyberHeader — sticky top navigation bar used on every admin screen.
 *
 * Props:
 *  title     — string shown after "QF//"
 *  backTo    — route path for the ← BACK button (omit to hide it)
 *  onBack    — optional callback override (if you need custom logic before navigating)
 *  extra     — JSX slot rendered between title and sign-out button
 *  hideSignOut — hide the sign-out button (e.g. on the sign-in page itself)
 */
export default function CyberHeader({ title, backTo, onBack, extra, hideSignOut = false }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  function handleBack() {
    if (onBack) { onBack(); return; }
    if (backTo)  { navigate(backTo); }
  }

  function handleSignOut() {
    signOut();
    navigate("/signin");
  }

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {(backTo || onBack) && (
          <button className="cyber-btn" style={styles.backBtn} onClick={handleBack}>
            ← BACK
          </button>
        )}
        <span style={styles.title}>
          <span style={styles.prefix}>QF//</span>
          {title}
        </span>
      </div>

      <div style={styles.right}>
        {extra}
        {!hideSignOut && (
          <button className="cyber-btn danger" style={styles.signOutBtn} onClick={handleSignOut}>
            SIGN OUT
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "rgba(6,15,26,0.98)",
    borderBottom: "1px solid var(--cyber-border)",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(8px)",
  },
  left: { display: "flex", alignItems: "center", gap: 16 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  title: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 13,
    color: "var(--cyber-glow)",
    letterSpacing: 3,
  },
  prefix: { color: "var(--cyber-dim)", marginRight: 4 },
  backBtn: { padding: "6px 14px", fontSize: 10 },
  signOutBtn: { padding: "6px 14px", fontSize: 10 },
};
