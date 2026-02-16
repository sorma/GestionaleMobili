"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles/order-montaggi-list.module.css";

const MESI = [
  { value: "01", label: "Gennaio" },
  { value: "02", label: "Febbraio" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Aprile" },
  { value: "05", label: "Maggio" },
  { value: "06", label: "Giugno" },
  { value: "07", label: "Luglio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Settembre" },
  { value: "10", label: "Ottobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Dicembre" },
];

function formatEUR(n) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    Number(n || 0)
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(255,255,255,0.85)",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: "#0f172a",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ title, value, tone = "slate", sub }) {
  const tones = {
    slate: { bg: "rgba(255,255,255,0.92)", border: "rgba(15,23,42,0.10)", accent: "#334155" },
    green: { bg: "rgba(240,253,244,0.92)", border: "rgba(22,101,52,0.18)", accent: "#166534" },
    red: { bg: "rgba(254,242,242,0.92)", border: "rgba(153,27,27,0.18)", accent: "#991b1b" },
    indigo: { bg: "rgba(238,242,255,0.92)", border: "rgba(67,56,202,0.18)", accent: "#3730a3" },
  };

  const t = tones[tone] ?? tones.slate;

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        background: t.bg,
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ color: "#334155", fontSize: 13, fontWeight: 800 }}>{title}</div>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: t.accent,
            marginTop: 4,
            flex: "0 0 auto",
          }}
        />
      </div>

      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
        {value}
      </div>

      {sub ? (
        <div style={{ marginTop: 8, color: "#64748b", fontSize: 12, lineHeight: 1.3 }}>{sub}</div>
      ) : null}
    </div>
  );
}

export default function GuadagniPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterYear, setFilterYear] = useState("tutti");
  const [filterMonth, setFilterMonth] = useState("tutti");

  const [data, setData] = useState({
    costiExtra: 0,
    costiOrdini: 0,
    costiTotali: 0,
    ricaviOrdini: 0,
    ricaviMontaggi: 0,
    ricaviTotali: 0,
    differenza: 0,
  });

  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  }, []);

  const selectedLabel = useMemo(() => {
    if (filterYear === "tutti") return "Tutti gli anni";
    if (filterMonth === "tutti") return `Anno ${filterYear}`;
    const mese = MESI.find((m) => m.value === filterMonth)?.label || filterMonth;
    return `${mese} ${filterYear}`;
  }, [filterYear, filterMonth]);

  const fetchGuadagni = async (year, month) => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams({
        year: year || "tutti",
        month: month || "tutti",
      });

      const res = await fetch(`/api/guadagni?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Errore HTTP! status: ${res.status}`);
      const json = await res.json();

      setData({
        costiExtra: Number(json.costiExtra || 0),
        costiOrdini: Number(json.costiOrdini || 0),
        costiTotali: Number(json.costiTotali || 0),
        ricaviOrdini: Number(json.ricaviOrdini || 0),
        ricaviMontaggi: Number(json.ricaviMontaggi || 0),
        ricaviTotali: Number(json.ricaviTotali || 0),
        differenza: Number(json.differenza || 0),
      });
    } catch (err) {
      console.error("Errore caricamento guadagni:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuadagni(filterYear, filterMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeYear = (y) => {
    setFilterYear(y);
    setFilterMonth("tutti");
    fetchGuadagni(y, "tutti");
  };

  const onChangeMonth = (m) => {
    setFilterMonth(m);
    fetchGuadagni(filterYear, m);
  };

  useEffect(() => {
    return () => {
      // cleanup: quando esci dalla pagina /guadagni
      fetch("/api/pin/logout", {
        method: "POST",
        cache: "no-store",
        keepalive: true, // aiuta quando stai cambiando pagina
      }).catch(() => {});
    };
  }, []);


  const isPositive = data.differenza >= 0;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Guadagni effettivi</h1>
            <p className={styles.subheading}>
              Ricavi (Preventivi ordini + Importo montaggi) − Costi (Costi extra + Costo ordini).
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {/* Top rail: periodo + azione */}
        <div className={styles.toolbar}>
          <div className={styles.counter} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Periodo:</span> <Badge>{selectedLabel}</Badge>
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.primaryLink}
              onClick={() => fetchGuadagni(filterYear, filterMonth)}
            >
              Aggiorna
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Calcolo guadagni...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBoxError}>
            <p>Errore: {error}</p>
          </div>
        ) : (
          <>
            {/* Filtri */}
            <div className={styles.filtersContainer}>
              <div className={styles.filterSelects}>
                <div className={styles.filterGroup}>
                  <label htmlFor="filterYear">Anno</label>
                  <select id="filterYear" value={filterYear} onChange={(e) => onChangeYear(e.target.value)}>
                    <option value="tutti">Tutti</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label htmlFor="filterMonth">Mese</label>
                  <select
                    id="filterMonth"
                    value={filterMonth}
                    onChange={(e) => onChangeMonth(e.target.value)}
                    disabled={filterYear === "tutti"}
                    title={filterYear === "tutti" ? "Seleziona prima un anno" : ""}
                  >
                    <option value="tutti">{filterYear === "tutti" ? "Seleziona anno" : "Tutti"}</option>
                    {MESI.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                marginTop: 14,
              }}
            >
              <StatCard
                title="Ricavi totali"
                value={formatEUR(data.ricaviTotali)}
                tone="indigo"
                sub={`Ordini: ${formatEUR(data.ricaviOrdini)} • Montaggi: ${formatEUR(data.ricaviMontaggi)}`}
              />
              <StatCard
                title="Costi totali"
                value={formatEUR(data.costiTotali)}
                tone="slate"
                sub={`Extra: ${formatEUR(data.costiExtra)} • Ordini (costo): ${formatEUR(data.costiOrdini)}`}
              />
              <StatCard
                title="Differenza"
                value={formatEUR(data.differenza)}
                tone={isPositive ? "green" : "red"}
                sub={isPositive ? "Situazione positiva." : "Attenzione: costi superiori ai ricavi."}
              />
            </div>
            {/* Dettaglio (più leggibile) */}
            <div style={{ marginTop: 16 }}>
                <div
                    className={styles.tableWrap}
                    style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.92)",
                    boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
                    }}
                >
                    <table
                    className={styles.table}
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                    }}
                    >
                    <caption
                        style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        fontWeight: 900,
                        color: "#0f172a",
                        background: "linear-gradient(to bottom, rgba(248,250,252,1), rgba(255,255,255,1))",
                        borderBottom: "1px solid rgba(15,23,42,0.08)",
                        }}
                    >
                        Dettaglio calcolo
                    </caption>

                    <thead>
                        <tr>
                        <th
                            scope="col"
                            style={{
                            textAlign: "left",
                            padding: "12px 16px",
                            fontSize: 12,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "#475569",
                            background: "rgba(248,250,252,0.9)",
                            borderBottom: "1px solid rgba(15,23,42,0.08)",
                            }}
                        >
                            Voce
                        </th>

                        <th
                            scope="col"
                            style={{
                            textAlign: "right",
                            padding: "12px 16px",
                            fontSize: 12,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "#475569",
                            background: "rgba(248,250,252,0.9)",
                            borderBottom: "1px solid rgba(15,23,42,0.08)",
                            width: 220,
                            }}
                        >
                            Valore
                        </th>
                        </tr>
                    </thead>

                    <tbody>
                        {[
                        { label: "Ricavi ordini (preventivo)", value: data.ricaviOrdini, kind: "ricavo" },
                        { label: "Ricavi montaggi (importo)", value: data.ricaviMontaggi, kind: "ricavo" },
                        { label: "Costi extra (tabella costi)", value: data.costiExtra, kind: "costo" },
                        { label: "Costi ordini (costo)", value: data.costiOrdini, kind: "costo" },
                        ].map((row, idx) => {
                        const isOdd = idx % 2 === 0;
                        const dotColor = row.kind === "ricavo" ? "#3730a3" : "#334155";

                        return (
                            <tr
                            key={row.label}
                            style={{
                                background: isOdd ? "rgba(248,250,252,0.55)" : "rgba(255,255,255,1)",
                                transition: "background 120ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(226,232,240,0.35)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = isOdd
                                ? "rgba(248,250,252,0.55)"
                                : "rgba(255,255,255,1)";
                            }}
                            >
                            <td
                                style={{
                                padding: "14px 16px",
                                borderBottom: "1px solid rgba(15,23,42,0.06)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span
                                    style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 999,
                                    background: dotColor,
                                    flex: "0 0 auto",
                                    }}
                                />
                                <span style={{ color: "#0f172a", fontWeight: 700 }}>{row.label}</span>
                                </div>
                            </td>

                            <td
                                className={`${styles.mono} ${styles.nowrap}`}
                                style={{
                                padding: "14px 16px",
                                textAlign: "right",
                                borderBottom: "1px solid rgba(15,23,42,0.06)",
                                fontWeight: 800,
                                color: "#0f172a",
                                }}
                            >
                                {formatEUR(row.value)}
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>

                    <tfoot>
                        <tr>
                        <td
                            style={{
                            padding: "14px 16px",
                            background: "rgba(248,250,252,0.9)",
                            borderTop: "1px solid rgba(15,23,42,0.10)",
                            fontWeight: 900,
                            color: "#0f172a",
                            }}
                        >
                            Totale (Ricavi − Costi)
                        </td>

                        <td
                            className={`${styles.mono} ${styles.nowrap}`}
                            style={{
                            padding: "14px 16px",
                            textAlign: "right",
                            background: "rgba(248,250,252,0.9)",
                            borderTop: "1px solid rgba(15,23,42,0.10)",
                            fontWeight: 900,
                            color: isPositive ? "#166534" : "#991b1b",
                            }}
                        >
                            {formatEUR(data.differenza)}
                        </td>
                        </tr>
                    </tfoot>
                    </table>
                </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
