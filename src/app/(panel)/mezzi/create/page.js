"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../../styles/form.module.css";

const BRAND_MODELS = {
  Ford: ["Transit", "Transit Custom", "Transit Connect", "Transit Courier"],
  "Fiat Professional": ["Ducato", "Doblò", "Scudo"],
  "Mercedes-Benz": ["Sprinter", "Vito", "Citan"],
  Renault: ["Master", "Trafic", "Kangoo"],
  Volkswagen: ["Crafter", "Transporter", "Caddy"],
  Iveco: ["Daily"],
  Peugeot: ["Boxer", "Expert", "Partner"],
  "Citroën": ["Jumper", "Jumpy", "Berlingo"],
  Opel: ["Movano", "Vivaro", "Combo"],
  Nissan: ["Interstar", "Primastar", "Townstar"],
};

export default function CreateMezzoForm() {
  const [marca, setMarca] = useState("");
  const [modello, setModello] = useState("");
  const [anno, setAnno] = useState("");

  const [scadenzaRevisione, setScadenzaRevisione] = useState("");
  const [scadenzaAssicurazione, setScadenzaAssicurazione] = useState("");
  const [scadenzaTagliando, setScadenzaTagliando] = useState("");

  const [message, setMessage] = useState("");

  const brandList = useMemo(() => Object.keys(BRAND_MODELS).sort(), []);
  const modelList = useMemo(
    () => (marca ? BRAND_MODELS[marca] ?? [] : []),
    [marca]
  );

  const resetForm = () => {
    setMarca("");
    setModello("");
    setAnno("");
    setScadenzaRevisione("");
    setScadenzaAssicurazione("");
    setScadenzaTagliando("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!marca) {
      setMessage("Errore: Seleziona una marca.");
      return;
    }

    if (!modello) {
      setMessage("Errore: Seleziona un modello.");
      return;
    }

    const annoNum = anno === "" ? null : Number(anno);
    if (annoNum !== null && (Number.isNaN(annoNum) || annoNum < 1900)) {
      setMessage("Errore: Anno non valido.");
      return;
    }

    try {
      const response = await fetch("/api/mezzi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca,
          modello,
          anno: annoNum,
          scadenza_revisione: scadenzaRevisione || null,
          scadenza_assicurazione: scadenzaAssicurazione || null,
          scadenza_tagliando: scadenzaTagliando || null,
        }),
      });

      if (response.ok) {
        setMessage("Mezzo creato con successo!");
        resetForm();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(
          `Errore nella creazione del mezzo: ${
            errorData?.error || "Impossibile creare il mezzo."
          }`
        );
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
            <p className={styles.pageEyebrow}>Mezzi</p>
            <h1 className={styles.heading}>Crea nuovo mezzo</h1>
            <p className={styles.subheading}>
              Inserisci i dati principali del veicolo e imposta le scadenze
              operative per revisione, assicurazione e tagliando.
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
            <h2 className={styles.sectionTitle}>Dati mezzo</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="marca">Marca</label>
                <select
                  id="marca"
                  value={marca}
                  onChange={(e) => {
                    const nextBrand = e.target.value;
                    setMarca(nextBrand);
                    setModello("");
                  }}
                  required
                >
                  <option value="">Seleziona marca</option>
                  {brandList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="modello">Modello</label>
                <select
                  id="modello"
                  value={modello}
                  onChange={(e) => setModello(e.target.value)}
                  required
                  disabled={!marca}
                  title={!marca ? "Seleziona prima una marca" : ""}
                >
                  <option value="">
                    {marca ? "Seleziona modello" : "Seleziona prima la marca"}
                  </option>
                  {modelList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="anno">Anno</label>
                <input
                  type="number"
                  id="anno"
                  value={anno}
                  onChange={(e) => setAnno(e.target.value)}
                  min="1900"
                  step="1"
                  inputMode="numeric"
                  placeholder="Es. 2021"
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Scadenze</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="scadenzaRevisione">Scadenza revisione</label>
                <input
                  type="date"
                  id="scadenzaRevisione"
                  value={scadenzaRevisione}
                  onChange={(e) => setScadenzaRevisione(e.target.value)}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="scadenzaAssicurazione">Scadenza assicurazione</label>
                <input
                  type="date"
                  id="scadenzaAssicurazione"
                  value={scadenzaAssicurazione}
                  onChange={(e) => setScadenzaAssicurazione(e.target.value)}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="scadenzaTagliando">Scadenza tagliando</label>
                <input
                  type="date"
                  id="scadenzaTagliando"
                  value={scadenzaTagliando}
                  onChange={(e) => setScadenzaTagliando(e.target.value)}
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
              Crea mezzo
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
