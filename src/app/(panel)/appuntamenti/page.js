"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, Trash2, Users } from "lucide-react";
import styles from "../../../styles/list.module.css";

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatItDateTime(value) {
  const d = parseDate(value);
  if (!d) return String(value || "");

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getAppointmentStatus(value) {
  const date = parseDate(value);
  if (!date) return { label: "Non definito", className: "" };

  const now = new Date();

  if (isSameDay(date, now)) {
    return { label: "Oggi", className: styles.statusToday };
  }

  if (date > now) {
    return { label: "Programmato", className: styles.statusFuture };
  }

  return { label: "Passato", className: styles.statusPast };
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

        if (!res.ok) {
          throw new Error(data?.error || `Errore HTTP! status: ${res.status}`);
        }

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

  const todayCount = useMemo(() => {
    const now = new Date();
    return rows.filter((r) => {
      const d = parseDate(r.data_ora || r.start_at);
      return d && isSameDay(d, now);
    }).length;
  }, [rows]);

  const nextAppointment = useMemo(() => {
    const now = new Date();

    return (
      [...rows]
        .map((r) => ({
          ...r,
          _date: parseDate(r.data_ora || r.start_at),
        }))
        .filter((r) => r._date && r._date >= now)
        .sort((a, b) => a._date - b._date)[0] || null
    );
  }, [rows]);

  const handleDelete = async (id) => {
    const conferma = window.confirm(
      `Vuoi davvero eliminare l'appuntamento #${id}?`
    );
    if (!conferma) return;

    try {
      const res = await fetch(`/api/appuntamenti/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Errore eliminazione appuntamento");
      }

      setRows((prev) => prev.filter((x) => x.id !== id));
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
            <p className={styles.pageEyebrow}>Appuntamenti</p>
            <h1 className={styles.heading}>Agenda appuntamenti</h1>
            <p className={styles.subheading}>
              Visualizza, controlla e gestisci gli appuntamenti programmati con
              clienti e contatti commerciali.
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
              <CalendarDays size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Totale appuntamenti</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>
                Numero totale attualmente registrato
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock3 size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Appuntamenti oggi</p>
              <h3 className={styles.statValue}>{todayCount}</h3>
              <p className={styles.statMeta}>
                Interventi e visite pianificati per oggi
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Prossimo appuntamento</p>
              <h3 className={styles.statValueSmall}>
                {nextAppointment
                  ? formatItDateTime(
                      nextAppointment.data_ora || nextAppointment.start_at
                    )
                  : "Nessuno"}
              </h3>
              <p className={styles.statMeta}>
                {nextAppointment?.cliente_nome || "Nessun cliente programmato"}
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
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
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Elenco appuntamenti</h2>
                <p className={styles.panelSubtitle}>
                  Vista operativa con data, cliente, contatto e stato.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colId}>ID</th>
                    <th>Data e ora</th>
                    <th>Cliente</th>
                    <th>Telefono</th>
                    <th>Stato</th>
                    <th className={styles.colActions}>Azioni</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => {
                    const status = getAppointmentStatus(
                      r.data_ora || r.start_at
                    );

                    return (
                      <tr key={r.id}>
                        <td className={styles.mono}>{r.id}</td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {formatItDateTime(r.data_ora || r.start_at)}
                          </div>
                        </td>

                        <td>
                          <div
                            className={styles.cellPrimary}
                            title={r.cliente_nome || ""}
                          >
                            {r.cliente_nome || "-"}
                          </div>
                          <div className={styles.cellSecondary}>
                            Appuntamento #{r.id}
                          </div>
                        </td>

                        <td>
                          <span className={styles.contactPill}>
                            {r.telefono || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`${styles.statusBadge} ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className={styles.iconDangerButton}
                              aria-label={`Elimina appuntamento ${r.id}`}
                              title="Elimina appuntamento"
                              type="button"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
