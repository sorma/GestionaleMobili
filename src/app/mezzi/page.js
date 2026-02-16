"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

export default function MezziList() {
  const [mezzi, setMezzi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMezzi() {
      try {
        const response = await fetch("/api/mezzi", { cache: "no-store" });
        if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
        const data = await response.json();
        if (!active) return;
        setMezzi(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchMezzi();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => mezzi.length, [mezzi]);

  const handleDeleteMezzo = async (id) => {
    try {
      const response = await fetch(`/api/mezzi/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Errore eliminazione mezzo");
      setMezzi((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Mezzi</h1>
            <p className={styles.subheading}>Visualizza e gestisci i mezzi da lavoro.</p>
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
            <Link href="/mezzi/create" className={styles.primaryLink}>
              + Nuovo mezzo
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento mezzi...</p>
          </div>
        ) : message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : mezzi.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colId}>ID</th>
                  <th>Marca</th>
                  <th>Modello</th>
                  <th>Anno</th>
                  <th>Scadenza revisione</th>
                  <th>Scadenza assicurazione</th>
                  <th>Scadenza tagliando</th>
                  <th className={styles.colActions}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {mezzi.map((m) => (
                  <tr key={m.id}>
                    <td className={styles.mono}>{m.id}</td>
                    <td>{m.marca}</td>
                    <td>{m.modello}</td>
                    <td className={styles.mono}>{m.anno ?? "-"}</td>
                    <td className={styles.mono}>{m.scadenza_revisione ?? "-"}</td>
                    <td className={styles.mono}>{m.scadenza_assicurazione ?? "-"}</td>
                    <td className={styles.mono}>{m.scadenza_tagliando ?? "-"}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleDeleteMezzo(m.id)}
                          className={styles.deleteButton}
                          aria-label={`Elimina mezzo ${m.id}`}
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
            <p>Nessun mezzo presente</p>
          </div>
        )}
      </section>
    </main>
  );
}
