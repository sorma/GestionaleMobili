"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/form.module.css";

const TIPOLOGIE = [
  "Benzina",
  "Gomme",
  "Tagliando",
  "Revisione",
  "Assicurazione",
  "Ferramenta",
  "Danno",
  "Manodopera",
  "Attrezzatura",
];

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateCostoForm() {
  const [tipologia, setTipologia] = useState("");
  const [data, setData] = useState(todayYYYYMMDD());
  const [prezzo, setPrezzo] = useState("");

  const [message, setMessage] = useState("");

  const prezzoNumber = useMemo(() => {
    const n = Number(String(prezzo).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [prezzo]);

  const resetForm = () => {
    setTipologia("");
    setData(todayYYYYMMDD());
    setPrezzo("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!tipologia) {
      setMessage("Errore: Seleziona una tipologia.");
      return;
    }

    if (!data) {
      setMessage("Errore: Seleziona una data.");
      return;
    }

    if (Number.isNaN(prezzoNumber) || prezzoNumber <= 0) {
      setMessage("Errore: Inserisci un prezzo valido (> 0).");
      return;
    }

    try {
      const res = await fetch("/api/costi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipologia,
          data,
          prezzo: prezzoNumber,
        }),
      });

      if (res.ok) {
        setMessage("Costo inserito con successo!");
        resetForm();
      } else {
        const err = await res.json().catch(() => null);
        setMessage(`Errore: ${err?.error || "Impossibile inserire il costo."}`);
      }
    } catch (err) {
      setMessage(`Errore di rete: ${err?.message || "Errore sconosciuto"}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Costi</p>
            <h1 className={styles.heading}>Inserisci nuovo costo</h1>
            <p className={styles.subheading}>
              Registra una nuova voce di costo indicando tipologia, data e
              importo, così da mantenere il controllo economico aggiornato.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {message && (
          <div
            className={
              message.startsWith("Errore")
                ? styles.errorMessage
                : styles.successMessage
            }
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dati costo</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="tipologia">Tipologia</label>
                <select
                  id="tipologia"
                  value={tipologia}
                  onChange={(e) => setTipologia(e.target.value)}
                  required
                >
                  <option value="">Seleziona tipologia</option>
                  {TIPOLOGIE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="prezzo">Prezzo (€)</label>
                <div className={styles.currencyInput}>
                  <span>€</span>
                  <input
                    id="prezzo"
                    type="text"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                    inputMode="decimal"
                    placeholder="Es. 120,50"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetForm}
            >
              Annulla
            </button>

            <button type="submit" className={styles.primaryButton}>
              Inserisci costo
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
