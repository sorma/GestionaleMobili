"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import styles from "../../../styles/pin.module.css";

export default function GuadagniPinPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ pin }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "PIN errato.");

      router.replace("/guadagni");
      router.refresh();
    } catch (err) {
      setError(err.message || "PIN errato.");
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
              <FaShieldAlt />
            </span>
            <span className={styles.brandEyebrow}>Area riservata</span>
          </div>

          <h1 className={styles.brandTitle}>Verifica accesso ai guadagni</h1>

          <p className={styles.brandText}>
            Questa sezione contiene informazioni economiche sensibili e richiede
            una verifica aggiuntiva prima dell’accesso.
          </p>

          <div className={styles.brandMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Sezione</span>
              <span className={styles.metaValue}>Guadagni</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Protezione</span>
              <span className={styles.metaValue}>PIN dedicato</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Sicurezza</span>
              <span className={styles.metaValue}>Cookie httpOnly</span>
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>Verifica PIN</p>
            <h2 className={styles.formTitle}>Inserisci il codice di accesso</h2>
            <p className={styles.formSubtitle}>
              Digita il PIN configurato per continuare.
            </p>
          </div>

          <form onSubmit={submit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pin">
                PIN
              </label>
              <input
                id="pin"
                className={styles.input}
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                placeholder="Inserisci PIN"
                autoFocus
              />
            </div>

            {error ? <div className={styles.errorBox}>{error}</div> : null}

            <button className={styles.submit} type="submit" disabled={loading}>
              <FaArrowRight />
              <span>{loading ? "Verifica in corso..." : "Continua"}</span>
            </button>

            <div className={styles.footerNote}>
              <span className={styles.lockDot} aria-hidden="true" />
              Accesso protetto tramite verifica dedicata.
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
