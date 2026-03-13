"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/form.module.css";

const TIPI_PER_CATEGORIA = {
  armadio: [
    "ripiano",
    "anta battente",
    "anta scorrevole",
    "spalla",
    "base",
    "cappello",
  ],
  cucina: [
    "pensile",
    "base lavello",
    "base 90",
    "piano cottura induzione",
    "piano cottura gas",
    "lavastoviglie",
    "base forno",
    "pensile angolare",
  ],
};

export default function CreateMagazzinoForm() {
  const [macroCategoria, setMacroCategoria] = useState("");
  const [tipoPezzo, setTipoPezzo] = useState("");
  const [quantita, setQuantita] = useState("");
  const [riferimentoLavoro, setRiferimentoLavoro] = useState("");
  const [message, setMessage] = useState("");

  const tipiDisponibili = useMemo(() => {
    if (!macroCategoria) return [];
    return TIPI_PER_CATEGORIA[macroCategoria] ?? [];
  }, [macroCategoria]);

  useEffect(() => {
    setTipoPezzo("");
  }, [macroCategoria]);

  const resetForm = () => {
    setMacroCategoria("");
    setTipoPezzo("");
    setQuantita("");
    setRiferimentoLavoro("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/magazzino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          macro_categoria: macroCategoria,
          tipo_pezzo: tipoPezzo,
          quantita,
          riferimento_lavoro: riferimentoLavoro,
        }),
      });

      if (response.ok) {
        setMessage("Carico inserito in magazzino!");
        resetForm();
      } else {
        const err = await response.json().catch(() => null);
        setMessage(`Errore: ${err?.error || "Impossibile salvare."}`);
      }
    } catch (error) {
      setMessage(`Errore di rete: ${error?.message || "Errore sconosciuto"}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Magazzino</p>
            <h1 className={styles.heading}>Nuovo carico magazzino</h1>
            <p className={styles.subheading}>
              Seleziona categoria e tipo pezzo, inserisci la quantità e,
              se necessario, collega il movimento a un lavoro o a un ordine.
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
            <h2 className={styles.sectionTitle}>Selezione pezzo</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="macro_categoria">Macro categoria</label>
                <select
                  id="macro_categoria"
                  value={macroCategoria}
                  onChange={(e) => setMacroCategoria(e.target.value)}
                  required
                >
                  <option value="">Seleziona categoria</option>
                  <option value="armadio">Armadio</option>
                  <option value="cucina">Cucina</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="tipo_pezzo">Tipo pezzo</label>
                <select
                  id="tipo_pezzo"
                  value={tipoPezzo}
                  onChange={(e) => setTipoPezzo(e.target.value)}
                  disabled={!macroCategoria}
                  required
                >
                  <option value="">
                    {macroCategoria
                      ? "Seleziona tipo pezzo"
                      : "Prima scegli la categoria"}
                  </option>
                  {tipiDisponibili.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="quantita">Quantità (pz)</label>
                <input
                  id="quantita"
                  type="number"
                  min="0"
                  step="1"
                  value={quantita}
                  onChange={(e) => setQuantita(e.target.value)}
                  required
                  placeholder="0"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="riferimento_lavoro">
                  Riferimento lavoro (opzionale)
                </label>
                <input
                  id="riferimento_lavoro"
                  type="text"
                  value={riferimentoLavoro}
                  onChange={(e) => setRiferimentoLavoro(e.target.value)}
                  placeholder="Es. Ordine #123 / Cliente Rossi"
                />
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
              Inserisci
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
