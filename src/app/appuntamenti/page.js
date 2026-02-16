"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

function formatItDateTime(isoOrString) {
  const d = new Date(isoOrString);
  if (Number.isNaN(d.getTime())) return String(isoOrString || "");
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function AppuntamentiListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchRows() {
      try {
        const res = await fetch("/api/appuntamenti", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Errore HTTP! status: ${res.status}`);
        if (!active) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setMessage(`Errore nel caricamento: ${err.message}`);
        setRows([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchRows();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => rows.length, [rows]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/appuntamenti/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Errore eliminazione appuntamento");
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Agenda Appuntamenti</h1>
            <p className={styles.subheading}>Visualizza e gestisci gli appuntamenti.</p>
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
            <Link href="/appuntamenti/create" className={styles.primaryLink}>
              + Nuovo appuntamento
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento appuntamenti...</p>
          </div>
        ) : message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : rows.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colId}>ID</th>
                  <th>Data e ora</th>
                  <th>Cliente</th>
                  <th>Telefono</th>
                  <th className={styles.colActions}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.mono}>{r.id}</td>
                    <td className={styles.mono}>{formatItDateTime(r.data_ora || r.start_at)}</td>
                    <td className={styles.cellWrap} title={r.cliente_nome || ""}>
                      {r.cliente_nome || "-"}
                    </td>
                    <td className={styles.mono}>{r.telefono || "-"}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className={styles.deleteButton}
                          aria-label={`Elimina appuntamento ${r.id}`}
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
            <p>Nessun appuntamento presente</p>
          </div>
        )}
      </section>
    </main>
  );
}
