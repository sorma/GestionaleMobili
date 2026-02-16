"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
        const data = await response.json();
        if (!active) return;
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchClients();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => clients.length, [clients]);

  const handleDeleteClient = async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Errore eliminazione cliente");
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Clienti</h1>
            <p className={styles.subheading}>Visualizza e gestisci i clienti registrati.</p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.counter}>
            Totale: <strong>{total}</strong>
          </div>

          <div className={styles.toolbarActions}>
            <Link href="/clients/create" className={styles.primaryLink}>
              + Nuovo cliente
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento clienti...</p>
          </div>
        ) : message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : clients.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colId}>ID</th>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Telefono</th>
                  <th>Indirizzo</th>
                  <th>Nazione</th>
                  <th className={styles.colActions}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className={styles.mono}>{client.id}</td>
                    <td>{client.nome}</td>
                    <td>{client.cognome}</td>
                    <td className={styles.mono}>{client.telefono}</td>
                    <td className={styles.cellWrap} title={client.indirizzo || ""}>
                      {client.indirizzo}
                    </td>
                    <td>{client.nazione}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className={styles.deleteButton}
                          aria-label={`Elimina cliente ${client.id}`}
                          title="Elimina"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.stateBox}>
            <p>Nessun cliente presente</p>
          </div>
        )}
      </section>
    </main>
  );
}
