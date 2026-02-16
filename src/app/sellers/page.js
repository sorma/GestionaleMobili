"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

export default function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchSellers() {
      try {
        const response = await fetch("/api/sellers");
        if (!response.ok) {
          throw new Error(`Errore HTTP! status: ${response.status}`);
        }
        const data = await response.json();
        if (!active) return;
        setSellers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchSellers();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => sellers.length, [sellers]);

  const handleDeleteSeller = async (id) => {
    try {
      const response = await fetch(`/api/sellers/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Errore eliminazione venditore");
      setSellers((prev) => prev.filter((seller) => seller.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Venditori</h1>
            <p className={styles.subheading}>
              Visualizza e gestisci i venditori registrati.
            </p>
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
            <Link href="/sellers/create" className={styles.primaryLink}>
              + Nuovo venditore
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento venditori...</p>
          </div>
        ) : message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : sellers.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colId}>ID</th>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Telefono</th>
                  <th>Nazione</th>
                  <th className={styles.colActions}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className={styles.mono}>{seller.id}</td>
                    <td>{seller.nome}</td>
                    <td>{seller.cognome}</td>
                    <td className={styles.mono}>{seller.telefono}</td>
                    <td>{seller.nazione}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleDeleteSeller(seller.id)}
                          className={styles.deleteButton}
                          aria-label={`Elimina venditore ${seller.id}`}
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
            <p>Nessun venditore presente</p>
          </div>
        )}
      </section>
    </main>
  );
}
