"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaSignInAlt } from "react-icons/fa";
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
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brandPanel}>
          <div className={styles.brandTop}>
            <span className={styles.brandIcon}>
              <FaLock />
            </span>
            <span className={styles.brandEyebrow}>Gestionale</span>
          </div>

          <h1 className={styles.brandTitle}>Arredamenti Sormani</h1>

          <p className={styles.brandText}>
            Accesso all’area riservata per la gestione operativa di ordini,
            clienti, appuntamenti, montaggi e controllo aziendale.
          </p>

          <div className={styles.brandMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Ambiente</span>
              <span className={styles.metaValue}>Pannello amministrativo</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Accesso</span>
              <span className={styles.metaValue}>Credenziali riservate</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Sicurezza</span>
              <span className={styles.metaValue}>Sessione protetta</span>
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>Accesso</p>
            <h2 className={styles.formTitle}>Accedi al gestionale</h2>
            <p className={styles.formSubtitle}>
              Inserisci le credenziali per continuare.
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
              <FaSignInAlt />
              <span>{loading ? "Accesso in corso..." : "Accedi"}</span>
            </button>

            <div className={styles.footerNote}>
              <span className={styles.lockDot} aria-hidden="true" />
              Sessione autenticata tramite cookie httpOnly.
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
