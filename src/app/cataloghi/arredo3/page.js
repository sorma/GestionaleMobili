"use client";

import Link from "next/link";
import styles from "../../../styles/calendar.module.css";

const ONLINE_URL =
  "https://pdf-flip.arredo3.it/arredo3-catalogo-collection-cucine/?_gl=1*3d9k83*_gcl_aw*R0NMLjE3NzEyNDc5NDkuQ2p3S0NBaUFuY3ZNQmhCRUVpd0E5R1VfZnU0V2JfUHVzdlh5RkJ4b3RpZGtMdGp4a2M5bm1wcFRUaDZBOHpwbVowX05XVGI1LUhvcUN4b0NoLThRQXZEX0J3RQ..*_gcl_au*ODg2NTU3NDA4LjE3NzEyNDc3MjY.";

const OFFLINE_PDF = "/cataloghi/arredo3.pdf";

export default function CatalogoArredo3Page() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Catalogo Arredo3</h1>
            <p className={styles.subheading}>
              Apri online (sempre aggiornato) oppure consulta il PDF offline.
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
                title="Catalogo Arredo3 (PDF offline)"
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
