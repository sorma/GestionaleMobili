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

export default function CreateClientForm() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [indirizzo, setIndirizzo] = useState("");

  const [prefissoSelezionato, setPrefissoSelezionato] = useState("+39");
  const [nazioneSelezionata, setNazioneSelezionata] = useState("Italia");
  const [numeroTelefono, setNumeroTelefono] = useState("");

  const [message, setMessage] = useState("");
  const [erroreNumero, setErroreNumero] = useState("");

  const getFlagCode = (prefisso) => {
    const paese = prefissiEuropei.find((p) => p.value === prefisso);
    return paese ? paese.code : undefined;
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
    setIndirizzo("");
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
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cognome,
          telefono: numeroDaSalvare,
          indirizzo,
          nazione: nazioneSelezionata,
        }),
      });

      if (response.ok) {
        setMessage("Cliente creato con successo!");
        resetForm();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(
          `Errore nella creazione del cliente: ${
            errorData?.error || "Impossibile creare il cliente."
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
            <p className={styles.pageEyebrow}>Clienti</p>
            <h1 className={styles.heading}>Crea nuovo cliente</h1>
            <p className={styles.subheading}>
              Inserisci i dati anagrafici, l’indirizzo e i recapiti del cliente
              per completare correttamente la registrazione.
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
                  placeholder="Inserisci il nome"
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
                  placeholder="Inserisci il cognome"
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Indirizzo</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="indirizzo">Indirizzo completo</label>
                <input
                  type="text"
                  id="indirizzo"
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                  placeholder="Via, numero civico, città"
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Contatti</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="telefono">Numero di telefono</label>

                <div className={styles.phoneField}>
                  <div className={`${styles.formGroup} ${styles.phonePrefixBlock}`}>
                    <label htmlFor="prefisso" className={styles.phonePrefixLabel}>
                      Prefisso
                    </label>
                    <select
                      id="prefisso"
                      value={prefissoSelezionato}
                      onChange={handlePrefissoChange}
                      aria-label="Prefisso internazionale"
                    >
                      {prefissiEuropei.map((prefisso) => (
                        <option key={prefisso.value} value={prefisso.value}>
                          {prefisso.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`${styles.formGroup} ${styles.phoneNumberBlock}`}>
                    <label htmlFor="telefono" className={styles.phonePrefixLabel}>
                      Numero
                    </label>
                    <input
                      id="telefono"
                      type="text"
                      value={numeroTelefono}
                      onChange={handleNumeroTelefonoChange}
                      placeholder="Inserisci il numero"
                      inputMode="tel"
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "0.7rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    color: "#475569",
                    fontSize: "0.92rem",
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
                  <p
                    style={{
                      marginTop: "0.55rem",
                      color: "#991b1b",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
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
              Crea cliente
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
