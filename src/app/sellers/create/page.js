"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import styles from "../../../styles/form.module.css";

const prefissiEuropei = [
  { label: "Italia (+39)", value: "+39", code: "IT", nazione: "Italia" },
  { label: "Germania (+49)", value: "+49", code: "DE", nazione: "Germania" },
  { label: "Francia (+33)", value: "+33", code: "FR", nazione: "Francia" },
  { label: "Spagna (+34)", value: "+34", code: "ES", nazione: "Spagna" },
  { label: "Regno Unito (+44)", value: "+44", code: "GB", nazione: "Regno Unito" },
];

export default function CreateSellerForm() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");

  const [prefissoSelezionato, setPrefissoSelezionato] = useState("+39");
  const [nazioneSelezionata, setNazioneSelezionata] = useState("Italia");

  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [message, setMessage] = useState("");
  const [erroreNumero, setErroreNumero] = useState("");

  const getFlagCode = (prefisso) => {
    const paese = prefissiEuropei.find((p) => p.value === prefisso);
    return paese ? paese.code : "IT";
  };

  const handlePrefissoChange = (e) => {
    const selectedValue = e.target.value;
    setPrefissoSelezionato(selectedValue);

    const prefissoInfo = prefissiEuropei.find((p) => p.value === selectedValue);
    setNazioneSelezionata(prefissoInfo ? prefissoInfo.nazione : "");
  };

  const handleNumeroTelefonoChange = (e) => {
    const value = e.target.value;

    if (/^[0-9\s]*$/.test(value)) {
      setNumeroTelefono(value);
      setErroreNumero("");
    } else {
      setErroreNumero("Inserisci solo numeri e spazi.");
    }
  };

  const resetForm = () => {
    setNome("");
    setCognome("");
    setPrefissoSelezionato("+39");
    setNazioneSelezionata("Italia");
    setNumeroTelefono("");
    setErroreNumero("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (erroreNumero) {
      setMessage("Errore: Correggi gli errori nel form.");
      return;
    }

    const numeroDaSalvare = numeroTelefono.replace(/\s/g, "");

    try {
      const response = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cognome,
          telefono: numeroDaSalvare,
          nazione: nazioneSelezionata,
          prefisso: prefissoSelezionato,
        }),
      });

      if (response.ok) {
        setMessage("Venditore creato con successo!");
        resetForm();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(
          `Errore: ${errorData?.error || "Impossibile creare il venditore"}`
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
            <p className={styles.pageEyebrow}>Venditori</p>
            <h1 className={styles.heading}>Crea nuovo venditore</h1>
            <p className={styles.subheading}>
              Inserisci i dati anagrafici e il contatto telefonico del venditore.
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
            <h2 className={styles.sectionTitle}>Informazioni personali</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="cognome">Cognome</label>
                <input
                  type="text"
                  id="cognome"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Contatti</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>Numero di telefono</label>

                <div style={{ marginTop: "0.75rem" }}>
                  <label htmlFor="prefisso" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Prefisso
                  </label>
                  <select
                    id="prefisso"
                    value={prefissoSelezionato}
                    onChange={handlePrefissoChange}
                  >
                    {prefissiEuropei.map((prefisso) => (
                      <option key={prefisso.value} value={prefisso.value}>
                        {prefisso.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <label htmlFor="telefono" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Numero
                  </label>
                  <input
                    id="telefono"
                    type="text"
                    value={numeroTelefono}
                    onChange={handleNumeroTelefonoChange}
                    placeholder="Inserisci il numero"
                    inputMode="tel"
                    required
                  />
                </div>

                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  <ReactCountryFlag
                    countryCode={getFlagCode(prefissoSelezionato)}
                    svg
                    style={{ width: "1.2em", height: "1.2em" }}
                    title={nazioneSelezionata}
                  />
                  <span>{nazioneSelezionata}</span>
                </div>

                {erroreNumero && (
                  <p className={styles.inputError} style={{ marginTop: "0.75rem" }}>
                    {erroreNumero}
                  </p>
                )}
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
              Crea venditore
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
