"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../../styles/form.module.css";

function toDatetimeLocalValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function CreateAppuntamentoPage() {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const [dataOra, setDataOra] = useState(() => toDatetimeLocalValue(new Date()));
  const [clientId, setClientId] = useState("");
  const [telefono, setTelefono] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchClients() {
      try {
        const res = await fetch("/api/clients", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!active) return;
        setClients(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setClients([]);
        setMessage(`Errore caricamento clienti: ${e.message}`);
      } finally {
        if (!active) return;
        setClientsLoading(false);
      }
    }

    fetchClients();

    return () => {
      active = false;
    };
  }, []);

  const clientsOptions = useMemo(() => {
    return clients.map((c) => ({
      id: String(c.id),
      label: `${c.nome} ${c.cognome}`.trim(),
      telefono: c.telefono ? String(c.telefono) : "",
    }));
  }, [clients]);

  const onSelectClient = (id) => {
    setClientId(id);
    const found = clientsOptions.find((x) => x.id === id);
    setTelefono(found?.telefono || "");
  };

  const resetForm = () => {
    setDataOra(toDatetimeLocalValue(new Date()));
    setClientId("");
    setTelefono("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!clientId) {
      setMessage("Errore: seleziona un cliente.");
      return;
    }

    if (!telefono) {
      setMessage("Errore: il cliente selezionato non ha un telefono salvato.");
      return;
    }

    try {
      const res = await fetch("/api/appuntamenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          data_ora: dataOra,
          client_id: clientId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("Appuntamento creato con successo!");
        resetForm();
      } else {
        setMessage(
          `Errore nella creazione dell'appuntamento: ${
            data?.error || "Impossibile creare l'appuntamento."
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
            <p className={styles.pageEyebrow}>Appuntamenti</p>
            <h1 className={styles.heading}>Crea nuovo appuntamento</h1>
            <p className={styles.subheading}>
              Inserisci data e ora dell’appuntamento, seleziona il cliente e
              verifica automaticamente il recapito associato.
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
            <h2 className={styles.sectionTitle}>Dettagli appuntamento</h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="dataOra">Data e ora</label>
                <input
                  type="datetime-local"
                  id="dataOra"
                  value={dataOra}
                  onChange={(e) => setDataOra(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupThird}`}>
                <label htmlFor="cliente">Cliente</label>
                <select
                  id="cliente"
                  value={clientId}
                  onChange={(e) => onSelectClient(e.target.value)}
                  required
                  disabled={clientsLoading}
                >
                  <option value="">
                    {clientsLoading ? "Caricamento clienti..." : "Seleziona cliente"}
                  </option>
                  {clientsOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="telefono">Telefono</label>
                <div className={styles.readOnlyField} id="telefono">
                  {telefono || "Telefono preso automaticamente dal cliente selezionato"}
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
              Crea appuntamento
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
