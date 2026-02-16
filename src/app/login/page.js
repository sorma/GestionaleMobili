"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Errore di login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="appBg">
      {/* Sfondo come Home (global CSS) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="appBg__image" />
        <div className="appBg__overlay" />
        <div className="appBg__gradient" />
      </div>

      <div className="appBg__content relative mx-auto max-w-7xl px-4 py-10 md:px-12">
        {/* HEADER identico alla Home */}
        <header className="relative z-10 -mx-4 md:-mx-12 mb-10 border-b border-slate-200/90 bg-white/75 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-12">
            <div>
              <div className="inline-flex items-center gap-3 text-slate-700">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/80 backdrop-blur">
                  {/* “pallino” come logo minimal */}
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded bg-gradient-to-br from-indigo-600 to-sky-500 shadow-[0_0_0_4px_rgba(79,70,229,0.10)]"
                  />
                </span>
                <span className="text-sm font-medium tracking-wide uppercase">
                  Gestionale
                </span>
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Accesso
              </h1>

              <p className="mt-2 max-w-2xl text-base text-slate-600">
                Inserisci le credenziali per accedere al gestionale.
              </p>
            </div>
          </div>
        </header>

        {/* FORM */}
        <section className={styles.content}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Login</h2>
              <p className={styles.cardHint}>
                Usa le credenziali configurate in <code>.env.local</code>.
              </p>
            </div>

            <form onSubmit={onSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="Inserisci username"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Inserisci password"
                />
              </div>

              {error ? <div className={styles.errorBox}>{error}</div> : null}

              <button className={styles.submit} type="submit" disabled={loading}>
                {loading ? "Accesso in corso…" : "Accedi"}
              </button>

              <div className={styles.footerNote}>
                <span className={styles.lockDot} aria-hidden="true" />
                Sessione protetta tramite cookie httpOnly.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
