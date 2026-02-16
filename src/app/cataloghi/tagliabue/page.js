"use client";

import Link from "next/link";
import styles from "../../../styles/calendar.module.css";

const ONLINE_URL =
  "https://tagliabuemobili.com/pdf/Tagliabue_New_interior_perspectives.pdf";

const OFFLINE_PDF = "/cataloghi/tagliabue.pdf";

export default function CatalogoTagliabuePage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Catalogo Tagliabue</h1>
            <p className={styles.subheading}>
              Apri online oppure consulta il PDF offline salvato nel gestionale.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Azioni rapide</h2>

            <div className={styles.legend}>
              <a
                href={ONLINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.backButton}
                style={{ fontWeight: 900 }}
              >
                Apri online ↗
              </a>

              <a
                href={OFFLINE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.backButton}
                style={{ fontWeight: 900 }}
              >
                Apri PDF offline ↗
              </a>

              <a
                href={OFFLINE_PDF}
                download
                className={styles.backButton}
                style={{ fontWeight: 900 }}
              >
                Scarica PDF
              </a>
            </div>
          </div>

          <div style={{ padding: "1rem" }}>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <iframe
                title="Catalogo Tagliabue (PDF offline)"
                src={OFFLINE_PDF}
                style={{ width: "100%", height: "78vh", border: 0 }}
              />
            </div>

            <p style={{ marginTop: "0.75rem", color: "#475569", fontWeight: 800 }}>
              Se il PDF non si vede, usa “Apri PDF offline” oppure “Scarica PDF”.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
