"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Truck, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getScadenzaStatus(dateString) {
  const date = parseDate(dateString);
  if (!date) return { label: "-", className: "" };

  const now = new Date();
  const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Scaduta", className: styles.statusPast };
  }

  if (diffDays <= 30) {
    return { label: "In scadenza", className: styles.statusToday };
  }

  return { label: "OK", className: styles.statusFuture };
}

export default function MezziList() {
  const [mezzi, setMezzi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMezzi() {
      try {
        const response = await fetch("/api/mezzi", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Errore HTTP! status: ${response.status}`);
        }

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

  const scadutiCount = useMemo(() => {
    const now = new Date();

    return mezzi.filter((m) => {
      const dates = [
        m.scadenza_revisione,
        m.scadenza_assicurazione,
        m.scadenza_tagliando,
      ];

      return dates.some((d) => {
        const date = parseDate(d);
        return date && date < now;
      });
    }).length;
  }, [mezzi]);

  const inScadenzaCount = useMemo(() => {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return mezzi.filter((m) => {
      const dates = [
        m.scadenza_revisione,
        m.scadenza_assicurazione,
        m.scadenza_tagliando,
      ];

      return dates.some((d) => {
        const date = parseDate(d);
        return date && date >= now && date <= futureLimit;
      });
    }).length;
  }, [mezzi]);

  const okCount = useMemo(() => {
    return total - scadutiCount - inScadenzaCount;
  }, [total, scadutiCount, inScadenzaCount]);

  const handleDeleteMezzo = async (id) => {
    const conferma = window.confirm(`Vuoi davvero eliminare il mezzo #${id}?`);
    if (!conferma) return;

    try {
      const response = await fetch(`/api/mezzi/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Errore eliminazione mezzo");
      }

      setMezzi((prev) => prev.filter((m) => m.id !== id));
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
            <p className={styles.pageEyebrow}>Mezzi</p>
            <h1 className={styles.heading}>Parco veicoli</h1>
            <p className={styles.subheading}>
              Monitora lo stato dei mezzi aziendali, scadenze documentali e
              manutenzioni programmate.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : null}

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Truck size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Mezzi totali</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>Veicoli registrati nel parco</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Scadenze OK</p>
              <h3 className={styles.statValue}>{okCount}</h3>
              <p className={styles.statMeta}>
                Mezzi senza scadenze imminenti
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Attenzione richiesta</p>
              <h3 className={styles.statValue}>
                {inScadenzaCount} / {scadutiCount}
              </h3>
              <p className={styles.statMeta}>
                In scadenza (30gg) / Scaduti
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/mezzi/create" className={styles.primaryLink}>
              + Nuovo mezzo
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento mezzi...</p>
          </div>
        ) : mezzi.length > 0 ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Registro veicoli</h2>
                <p className={styles.panelSubtitle}>
                  Vista completa con marca, modello, anno e monitoraggio
                  scadenze revisione, assicurazione e tagliando.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colId}>ID</th>
                    <th>Veicolo</th>
                    <th>Revisione</th>
                    <th>Assicurazione</th>
                    <th>Tagliando</th>
                    <th className={styles.colActions}>Azioni</th>
                  </tr>
                </thead>

                <tbody>
                  {mezzi.map((m) => {
                    const revStatus = getScadenzaStatus(m.scadenza_revisione);
                    const assStatus = getScadenzaStatus(m.scadenza_assicurazione);
                    const tagStatus = getScadenzaStatus(m.scadenza_tagliando);

                    return (
                      <tr key={m.id}>
                        <td className={styles.mono}>{m.id}</td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {m.marca} {m.modello}
                          </div>
                          <div className={styles.cellSecondary}>
                            Anno {m.anno ?? "non specificato"}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {m.scadenza_revisione || "-"}
                          </div>
                          {m.scadenza_revisione && (
                            <span className={`${styles.statusBadge} ${revStatus.className}`}>
                              {revStatus.label}
                            </span>
                          )}
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {m.scadenza_assicurazione || "-"}
                          </div>
                          {m.scadenza_assicurazione && (
                            <span className={`${styles.statusBadge} ${assStatus.className}`}>
                              {assStatus.label}
                            </span>
                          )}
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {m.scadenza_tagliando || "-"}
                          </div>
                          {m.scadenza_tagliando && (
                            <span className={`${styles.statusBadge} ${tagStatus.className}`}>
                              {tagStatus.label}
                            </span>
                          )}
                        </td>

                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleDeleteMezzo(m.id)}
                              className={styles.iconDangerButton}
                              aria-label={`Elimina mezzo ${m.id}`}
                              title="Elimina mezzo"
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
            <p>Nessun mezzo presente</p>
          </div>
        )}
      </section>
    </main>
  );
}
