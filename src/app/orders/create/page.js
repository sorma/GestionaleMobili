"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/form.module.css";

export default function CreateOrderForm() {
  const [venditori, setVenditori] = useState([]);
  const [clienti, setClienti] = useState([]);

  const [venditoreId, setVenditoreId] = useState("");
  const [clienteId, setClienteId] = useState("");

  const [dataOrdine, setDataOrdine] = useState("");
  const [costo, setCosto] = useState("");
  const [preventivo, setPreventivo] = useState("");
  const [numeroColli, setNumeroColli] = useState("");

  const [destinazioneAutomatica, setDestinazioneAutomatica] = useState("");
  const [message, setMessage] = useState("");

  const [disegnoFile, setDisegnoFile] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setMessage("");

      try {
        const [sellersResponse, clientsResponse] = await Promise.all([
          fetch("/api/sellers"),
          fetch("/api/clients"),
        ]);

        if (!sellersResponse.ok) {
          throw new Error(
            `Errore HTTP venditori! status: ${sellersResponse.status}`
          );
        }

        if (!clientsResponse.ok) {
          throw new Error(
            `Errore HTTP clienti! status: ${clientsResponse.status}`
          );
        }

        const sellersData = await sellersResponse.json();
        const clientsData = await clientsResponse.json();

        if (!active) return;
        setVenditori(Array.isArray(sellersData) ? sellersData : []);
        setClienti(Array.isArray(clientsData) ? clientsData : []);
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        if (!active) return;
        setMessage(
          `Errore nel caricamento dei dati: ${
            error?.message || "Errore sconosciuto"
          }`
        );
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const selectedClient = useMemo(() => {
    if (!clienteId) return null;
    const id = Number(clienteId);
    if (Number.isNaN(id)) return null;
    return clienti.find((c) => c?.id === id) ?? null;
  }, [clienteId, clienti]);

  useEffect(() => {
    if (!selectedClient) {
      setDestinazioneAutomatica("");
      return;
    }

    if (selectedClient.indirizzo) {
      setDestinazioneAutomatica(selectedClient.indirizzo);
    } else {
      setDestinazioneAutomatica("Indirizzo non disponibile per questo cliente");
    }
  }, [selectedClient]);

  const resetForm = () => {
    setVenditoreId("");
    setClienteId("");
    setDataOrdine("");
    setCosto("");
    setPreventivo("");
    setNumeroColli("");
    setDestinazioneAutomatica("");
    setMessage("");
    setDisegnoFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const vendId = Number(venditoreId);
    const cliId = Number(clienteId);
    const tot = Number(costo);
    const colli = Number(numeroColli);

    const prev =
      preventivo === "" || preventivo === null || preventivo === undefined
        ? null
        : Number(preventivo);

    if (!venditoreId || Number.isNaN(vendId)) {
      setMessage("Errore: Seleziona un venditore valido.");
      return;
    }

    if (!clienteId || Number.isNaN(cliId)) {
      setMessage("Errore: Seleziona un cliente valido.");
      return;
    }

    if (!dataOrdine) {
      setMessage("Errore: Seleziona una data ordine valida.");
      return;
    }

    if (Number.isNaN(tot) || tot < 0) {
      setMessage("Errore: Inserisci un costo valido (>= 0).");
      return;
    }

    if (Number.isNaN(colli) || colli < 0) {
      setMessage("Errore: Inserisci un numero colli valido (>= 0).");
      return;
    }

    if (prev !== null && (Number.isNaN(prev) || prev < 0)) {
      setMessage(
        "Errore: Inserisci un preventivo valido (>= 0) oppure lascia vuoto."
      );
      return;
    }

    if (
      !destinazioneAutomatica ||
      destinazioneAutomatica === "Indirizzo non disponibile per questo cliente"
    ) {
      setMessage(
        "Errore: Seleziona un cliente valido con un indirizzo per la destinazione."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("venditore_id", String(vendId));
      formData.append("cliente_id", String(cliId));
      formData.append("data_ordine", dataOrdine);
      formData.append("costo", String(tot));
      formData.append("preventivo", prev === null ? "" : String(prev));
      formData.append("numero_colli", String(colli));
      formData.append("destinazione", destinazioneAutomatica);

      if (disegnoFile) {
        formData.append("disegno", disegnoFile);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Ordine creato con successo!");
        resetForm();
      } else {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {}

        setMessage(
          `Errore nella creazione dell'ordine: ${
            errorData?.error || "Impossibile creare l'ordine."
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
            <p className={styles.pageEyebrow}>Ordini</p>
            <h1 className={styles.heading}>Crea nuovo ordine</h1>
            <p className={styles.subheading}>
              Inserisci i dati principali dell’ordine, completa i valori economici
              e verifica l’indirizzo di spedizione prima della conferma.
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
            <h2 className={styles.sectionTitle}>Informazioni base</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="venditoreId">Venditore</label>
                <select
                  id="venditoreId"
                  value={venditoreId}
                  onChange={(e) => setVenditoreId(e.target.value)}
                  required
                >
                  <option value="">Seleziona un venditore</option>
                  {venditori.map((venditore) => (
                    <option key={venditore.id} value={venditore.id}>
                      {venditore.nome} {venditore.cognome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="clienteId">Cliente</label>
                <select
                  id="clienteId"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  required
                >
                  <option value="">Seleziona un cliente</option>
                  {clienti.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} {cliente.cognome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dettagli ordine</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="dataOrdine">Data ordine</label>
                <input
                  type="date"
                  id="dataOrdine"
                  value={dataOrdine}
                  onChange={(e) => setDataOrdine(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="costo">Costo (€)</label>
                <div className={styles.currencyInput}>
                  <span>€</span>
                  <input
                    type="number"
                    id="costo"
                    value={costo}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setCosto("");
                        return;
                      }
                      const val = Number(raw);
                      if (Number.isNaN(val)) return;
                      setCosto(val < 0 ? "0" : raw);
                    }}
                    required
                    min="0"
                    step="50"
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="preventivo">Preventivo (€)</label>
                <div className={styles.currencyInput}>
                  <span>€</span>
                  <input
                    type="number"
                    id="preventivo"
                    value={preventivo}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setPreventivo("");
                        return;
                      }
                      const val = Number(raw);
                      if (Number.isNaN(val)) return;
                      setPreventivo(val < 0 ? "0" : raw);
                    }}
                    min="0"
                    step="50"
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupQuarter}`}>
                <label htmlFor="numeroColli">Numero colli</label>
                <input
                  type="number"
                  id="numeroColli"
                  value={numeroColli}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setNumeroColli("");
                      return;
                    }
                    const val = Number(raw);
                    if (Number.isNaN(val)) return;
                    setNumeroColli(val < 0 ? "0" : raw);
                  }}
                  required
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="disegno">Disegno (immagine)</label>
                <input
                  type="file"
                  id="disegno"
                  accept="image/*"
                  onChange={(e) => setDisegnoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Spedizione</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="destinazioneAutomatica">
                  Indirizzo di spedizione
                </label>
                <div className={styles.readOnlyField} id="destinazioneAutomatica">
                  {destinazioneAutomatica ||
                    "Seleziona un cliente per visualizzare l'indirizzo"}
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
              Crea ordine
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
