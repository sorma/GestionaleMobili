"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../../../styles/form.module.css";
import ReactCountryFlag from "react-country-flag";

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
      setMessage("Correggi gli errori nel form.");
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
          telefono: numeroDaSalvare, // solo numero
          nazione: nazioneSelezionata,
          prefisso: prefissoSelezionato, // prefisso separato
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
            <h1 className={styles.heading}>Crea Nuovo Venditore</h1>
            <p className={styles.subheading}>
              Inserisci i dati anagrafici e i contatti del venditore.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
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
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
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

            <div className={styles.formGroup}>
              <label htmlFor="telefono">Numero di telefono</label>

              {/* Layout migliorato: prefisso e numero non "attaccati" */}
              <div className={styles.phoneField}>
                <div className={styles.phonePrefixBlock}>
                  <div className={styles.phonePrefixLabel}>Prefisso</div>

                  <div className={styles.phonePrefix}>
                    <ReactCountryFlag
                      countryCode={getFlagCode(prefissoSelezionato)}
                      svg
                      style={{ width: "1.35em", height: "1.35em" }}
                      title={nazioneSelezionata}
                    />

                    <select
                      value={prefissoSelezionato}
                      onChange={handlePrefissoChange}
                      aria-label="Prefisso internazionale"
                    >
                      {prefissiEuropei.map((prefisso) => (
                        <option key={prefisso.value} value={prefisso.value}>
                          {prefisso.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.phoneNumberBlock}>
                  <div className={styles.phonePrefixLabel}>Numero</div>

                  <input
                    id="telefono"
                    type="text"
                    value={numeroTelefono}
                    onChange={handleNumeroTelefonoChange}
                    placeholder="Numero"
                    className={styles.phoneNumberInput}
                    inputMode="tel"
                  />
                </div>
              </div>

              {erroreNumero && (
                <p className={styles.inputError}>{erroreNumero}</p>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              Crea venditore
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetForm}
            >
              Annulla
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
