"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2, Users, MapPin, Globe } from "lucide-react";
import styles from "../../../styles/list.module.css";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok)
          throw new Error(`Errore HTTP! status: ${response.status}`);

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

  const uniqueCountries = useMemo(() => {
    const countries = new Set(
      clients.map((c) => c.nazione).filter((n) => n && n.trim())
    );
    return countries.size;
  }, [clients]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(
      clients
        .map((c) => {
          if (!c.indirizzo) return null;
          const parts = c.indirizzo.split(",");
          return parts[parts.length - 1]?.trim();
        })
        .filter((city) => city)
    );
    return cities.size;
  }, [clients]);

  const handleDeleteClient = async (id) => {
    const conferma = window.confirm(
      `Vuoi davvero eliminare il cliente #${id}?`
    );
    if (!conferma) return;

    try {
      const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Errore eliminazione cliente");
      }

      setClients((prev) => prev.filter((client) => client.id !== id));
      setMessage("");
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Clienti</p>
            <h1 className={styles.heading}>Anagrafica clienti</h1>
            <p className={styles.subheading}>
              Gestisci i dati anagrafici, di contatto e di localizzazione dei
              tuoi clienti attivi e potenziali.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Totale clienti</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>Clienti registrati nel sistema</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Globe size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Nazioni</p>
              <h3 className={styles.statValue}>{uniqueCountries}</h3>
              <p className={styles.statMeta}>Paesi rappresentati nella base clienti</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MapPin size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Città</p>
              <h3 className={styles.statValue}>{uniqueCities}</h3>
              <p className={styles.statMeta}>Località con presenza clienti</p>
            </div>
          </div>

          <div className={styles.ctaCard}>
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
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Elenco completo</h2>
                <p className={styles.panelSubtitle}>
                  Vista operativa con dati anagrafici, contatti e informazioni
                  geografiche.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colId}>ID</th>
                    <th>Cliente</th>
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

                      <td>
                        <div className={styles.cellPrimary}>
                          {client.nome} {client.cognome}
                        </div>
                        <div className={styles.cellSecondary}>
                          Cliente #{client.id}
                        </div>
                      </td>

                      <td>
                        <span className={styles.contactPill}>
                          {client.telefono || "-"}
                        </span>
                      </td>

                      <td
                        className={styles.cellWrap}
                        title={client.indirizzo || ""}
                      >
                        {client.indirizzo || "-"}
                      </td>

                      <td>
                        <div className={styles.cellPrimary}>
                          {client.nazione || "-"}
                        </div>
                      </td>

                      <td className={styles.actionsCell}>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className={styles.iconDangerButton}
                            aria-label={`Elimina cliente ${client.id}`}
                            title="Elimina cliente"
                            type="button"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
