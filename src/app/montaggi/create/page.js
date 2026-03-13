"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/form.module.css";

export default function CreateMontaggioForm() {
  const [indirizzo, setIndirizzo] = useState("");
  const [tipologia, setTipologia] = useState("");
  const [importo, setImporto] = useState("");
  const [giorniLavorativiStimati, setGiorniLavorativiStimati] = useState("");
  const [dataInizioStimata, setDataInizioStimata] = useState("");
  const [message, setMessage] = useState("");

  const [venditori, setVenditori] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [venditoreSelezionato, setVenditoreSelezionato] = useState("");
  const [clienteSelezionato, setClienteSelezionato] = useState("");

  const [indirizzoShouldBePrepopulated, setIndirizzoShouldBePrepopulated] =
    useState(false);
  const [isClienteSelectDisabled, setIsClienteSelectDisabled] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchVenditori() {
      try {
        const response = await fetch("/api/sellers");
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "Errore nel caricamento dei venditori.");
        }
        const data = await response.json();
        if (!active) return;
        setVenditori(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Errore venditori:", error);
        if (!active) return;
        setMessage(`Errore nel caricamento dei venditori: ${error?.message || ""}`);
      }
    }

    async function fetchClienti() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "Errore nel caricamento dei clienti.");
        }
        const data = await response.json();
        if (!active) return;
        setClienti(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Errore clienti:", error);
        if (!active) return;
        setMessage(`Errore nel caricamento dei clienti: ${error?.message || ""}`);
      }
    }

    setMessage("");
    fetchVenditori();
    fetchClienti();

    return () => {
      active = false;
    };
  }, []);

  const selectedVenditore = useMemo(() => {
    if (!venditoreSelezionato) return null;
    const id = Number(venditoreSelezionato);
    if (Number.isNaN(id)) return null;
    return venditori.find((v) => Number(v?._id ?? v?.id) === id) ?? null;
  }, [venditoreSelezionato, venditori]);

  const selectedCliente = useMemo(() => {
    if (!clienteSelezionato) return null;
    const id = Number(clienteSelezionato);
    if (Number.isNaN(id)) return null;
    return clienti.find((c) => Number(c?._id ?? c?.id) === id) ?? null;
  }, [clienteSelezionato, clienti]);

  useEffect(() => {
    const isSormani =
      selectedVenditore &&
      selectedVenditore.nome &&
      selectedVenditore.cognome &&
      ((selectedVenditore.nome === "Gaetano" &&
        selectedVenditore.cognome === "Sormani") ||
        (selectedVenditore.nome === "Francesco" &&
          selectedVenditore.cognome === "Sormani"));

    if (isSormani) {
      setIsClienteSelectDisabled(false);

      if (selectedCliente) {
        setIndirizzo(selectedCliente.indirizzo || "");
        setIndirizzoShouldBePrepopulated(true);
      } else {
        setIndirizzo("");
        setIndirizzoShouldBePrepopulated(true);
      }
      return;
    }

    setIsClienteSelectDisabled(true);
    setClienteSelezionato("");
    setIndirizzo("");
    setIndirizzoShouldBePrepopulated(false);
  }, [selectedVenditore, selectedCliente]);

  const resetForm = () => {
    setIndirizzo("");
    setTipologia("");
    setImporto("");
    setGiorniLavorativiStimati("");
    setDataInizioStimata("");
    setVenditoreSelezionato("");
    setClienteSelezionato("");
    setIndirizzoShouldBePrepopulated(false);
    setIsClienteSelectDisabled(true);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!venditoreSelezionato) {
      setMessage("Errore: Seleziona un venditore.");
      return;
    }

    if (!isClienteSelectDisabled && !clienteSelezionato) {
      setMessage("Errore: Seleziona un cliente.");
      return;
    }

    if (!indirizzo || !tipologia || importo === "" || giorniLavorativiStimati === "") {
      setMessage("Errore: Compila tutti i campi obbligatori.");
      return;
    }

    const imp = Number(importo);
    const giorni = Number(giorniLavorativiStimati);

    if (Number.isNaN(imp) || imp <= 0) {
      setMessage("Errore: L'importo deve essere maggiore di zero.");
      return;
    }

    if (Number.isNaN(giorni) || giorni <= 0) {
      setMessage("Errore: I giorni lavorativi stimati devono essere maggiori di zero.");
      return;
    }

    try {
      const response = await fetch("/api/montaggi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indirizzo,
          tipologia,
          importo: imp,
          giorni_lavorativi_stimati: giorni,
          data_inizio_stimata: dataInizioStimata || null,
          venditoreId: Number(venditoreSelezionato),
          clienteId: isClienteSelectDisabled ? null : Number(clienteSelezionato),
        }),
      });

      if (response.ok) {
        setMessage("Montaggio creato con successo!");
        resetForm();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(
          `Errore nella creazione del montaggio: ${
            errorData?.error || "Impossibile creare il montaggio."
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
            <p className={styles.pageEyebrow}>Montaggi</p>
            <h1 className={styles.heading}>Crea nuovo montaggio</h1>
            <p className={styles.subheading}>
              Assegna venditore e cliente, definisci l’intervento e completa i
              dati economici e operativi del montaggio.
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
            <h2 className={styles.sectionTitle}>Assegnazione</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="venditore">Venditore</label>
                <select
                  id="venditore"
                  value={venditoreSelezionato}
                  onChange={(e) => setVenditoreSelezionato(e.target.value)}
                  required
                >
                  <option value="">Seleziona un venditore</option>
                  {venditori.map((venditore) => (
                    <option
                      key={venditore._id || venditore.id}
                      value={venditore._id || venditore.id}
                    >
                      {venditore.nome} {venditore.cognome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="cliente">Cliente</label>
                <select
                  id="cliente"
                  value={clienteSelezionato}
                  onChange={(e) => setClienteSelezionato(e.target.value)}
                  required={!isClienteSelectDisabled}
                  disabled={isClienteSelectDisabled}
                >
                  <option value="">
                    {isClienteSelectDisabled
                      ? "Abilitato solo per venditori Sormani"
                      : "Seleziona un cliente"}
                  </option>
                  {clienti.map((cliente) => (
                    <option
                      key={cliente._id || cliente.id}
                      value={cliente._id || cliente.id}
                    >
                      {cliente.nome} {cliente.cognome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dettagli montaggio</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="indirizzo">Indirizzo del montaggio</label>
                {indirizzoShouldBePrepopulated ? (
                  <div className={styles.readOnlyField} id="indirizzo">
                    {indirizzo || "Seleziona un cliente per compilare l’indirizzo"}
                  </div>
                ) : (
                  <input
                    type="text"
                    id="indirizzo"
                    value={indirizzo}
                    onChange={(e) => setIndirizzo(e.target.value)}
                    required
                    placeholder="Via Roma 1, Milano"
                  />
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="tipologia">Tipologia</label>
                <select
                  id="tipologia"
                  value={tipologia}
                  onChange={(e) => setTipologia(e.target.value)}
                  required
                >
                  <option value="">Seleziona tipologia</option>
                  <option value="cucina">Cucina</option>
                  <option value="armadio">Armadio</option>
                  <option value="cameretta">Cameretta</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="importo">Importo montaggio (€)</label>
                <div className={styles.currencyInput}>
                  <span>€</span>
                  <input
                    type="number"
                    id="importo"
                    value={importo}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setImporto("");
                        return;
                      }
                      const val = Number(raw);
                      if (Number.isNaN(val)) return;
                      setImporto(val < 0 ? "0" : raw);
                    }}
                    required
                    min="0"
                    step="50"
                    placeholder="500.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="giorniLavorativiStimati">
                  Giorni lavorativi stimati
                </label>
                <input
                  type="number"
                  id="giorniLavorativiStimati"
                  value={giorniLavorativiStimati}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setGiorniLavorativiStimati("");
                      return;
                    }
                    const val = Number(raw);
                    if (Number.isNaN(val)) return;
                    setGiorniLavorativiStimati(val < 0 ? "0" : raw);
                  }}
                  required
                  min="0"
                  step="1"
                  placeholder="2"
                  inputMode="numeric"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="dataInizioStimata">Data inizio stimata</label>
                <input
                  type="date"
                  id="dataInizioStimata"
                  value={dataInizioStimata}
                  onChange={(e) => setDataInizioStimata(e.target.value)}
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
              Crea montaggio
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
