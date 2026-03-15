/**
 * AuthContext — stores whether the admin is logged in.
 *
 * We keep auth simple: one hardcoded admin credential checked client-side.
 * Session is persisted in sessionStorage so a page refresh doesn't log out.
 */

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem("qf_admin") === "true"
  );

  function signIn(username, password) {
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("qf_admin", "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function signOut() {
    sessionStorage.removeItem("qf_admin");
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Use inside any component that needs auth state */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
