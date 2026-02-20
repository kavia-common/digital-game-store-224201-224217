"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const auth = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.includes("@") && password.length >= (mode === "signup" ? 6 : 4), [
    email,
    password,
    mode,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError(mode === "signup" ? "Use a valid email and 6+ char password." : "Use a valid email and 4+ char password.");
      return;
    }
    setBusy(true);
    const res = mode === "login" ? await auth.login(email, password) : await auth.signup(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Auth</div>
            <p className="p-muted">
              Mock auth. Use an email containing <code>admin</code> to get ADMIN role.
            </p>
          </div>
          <Link className="btn" href="/">
            Home
          </Link>
        </div>

        <hr className="hr" />

        <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
          <div className="surface card">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className={`btn ${mode === "login" ? "btn-primary" : ""}`} onClick={() => setMode("login")}>
                Login
              </button>
              <button className={`btn ${mode === "signup" ? "btn-primary" : ""}`} onClick={() => setMode("signup")}>
                Signup
              </button>
              {auth.isAuthed ? (
                <button className="btn btn-danger" onClick={() => auth.logout()}>
                  Logout
                </button>
              ) : null}
            </div>

            <div style={{ marginTop: 12 }} className="p-muted">
              Status: <strong style={{ color: "var(--text)" }}>{auth.state.role}</strong>{" "}
              {auth.state.email ? `(${auth.state.email})` : ""}
            </div>

            <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 520 }}>
              <label>
                <span className="p-muted">Email</span>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                <span className="p-muted">Password</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "6+ characters" : "4+ characters"}
                />
              </label>

              {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={!canSubmit || busy} aria-disabled={!canSubmit || busy}>
                {busy ? "Working…" : mode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </div>

          <div className="surface card">
            <div className="h2">Next steps</div>
            <p className="p-muted" style={{ marginTop: 8 }}>
              Once backend auth endpoints exist, replace mock auth functions in <code>src/lib/apiClient.ts</code> with real calls.
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn" href="/catalog">
                Catalog
              </Link>
              <Link className="btn" href="/orders">
                Orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
