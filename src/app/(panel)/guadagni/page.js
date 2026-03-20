"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, AlertCircle, Calculator } from "lucide-react";
import styles from "../../../styles/list.module.css";

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
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(n || 0));
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

      const res = await fetch(`/api/guadagni?${qs.toString()}`, {
        cache: "no-store",
      });
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
      fetch("/api/pin/logout", {
        method: "POST",
        cache: "no-store",
        keepalive: true,
      }).catch(() => {});
    };
  }, []);

  const isPositive = data.differenza >= 0;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Finanza</p>
            <h1 className={styles.heading}>Guadagni Effettivi</h1>
            <p className={styles.subheading}>
              Analisi dei ricavi (preventivi ordini + importo montaggi) e costi
              (costi extra + costo ordini) con calcolo della differenza.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {error ? (
          <div className={styles.stateBoxError}>
            <p>Errore: {error}</p>
          </div>
        ) : null}

        {/* Filtri periodo */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="filterYear">Anno</label>
            <select
              id="filterYear"
              value={filterYear}
              onChange={(e) => onChangeYear(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="tutti">Tutti gli anni</option>
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
              className={styles.filterSelect}
              title={
                filterYear === "tutti" ? "Seleziona prima un anno" : ""
              }
            >
              <option value="tutti">
                {filterYear === "tutti" ? "Seleziona anno" : "Tutti i mesi"}
              </option>
              {MESI.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label style={{ opacity: 0 }}>Azione</label>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => fetchGuadagni(filterYear, filterMonth)}
              style={{ width: "100%" }}
            >
              Aggiorna dati
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>Calcolo guadagni in corso…</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className={styles.overviewGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>Ricavi totali</p>
                  <h3 className={styles.statValue}>
                    {formatEUR(data.ricaviTotali)}
                  </h3>
                  <p className={styles.statMeta}>
                    Ordini: {formatEUR(data.ricaviOrdini)} • Montaggi:{" "}
                    {formatEUR(data.ricaviMontaggi)}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>Costi totali</p>
                  <h3 className={styles.statValue}>
                    {formatEUR(data.costiTotali)}
                  </h3>
                  <p className={styles.statMeta}>
                    Extra: {formatEUR(data.costiExtra)} • Ordini:{" "}
                    {formatEUR(data.costiOrdini)}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  {isPositive ? (
                    <Calculator size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                </div>
                <div>
                  <p className={styles.statLabel}>Differenza netta</p>
                  <h3
                    className={styles.statValue}
                    style={{
                      color: isPositive ? "#166534" : "#991b1b",
                    }}
                  >
                    {formatEUR(data.differenza)}
                  </h3>
                  <p className={styles.statMeta}>
                    {isPositive
                      ? "Situazione positiva"
                      : "Attenzione: costi > ricavi"}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calculator size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>Periodo analizzato</p>
                  <h3 className={styles.statValueSmall}>{selectedLabel}</h3>
                  <p className={styles.statMeta}>Filtro applicato</p>
                </div>
              </div>
            </div>

            {/* Dettaglio calcolo */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Dettaglio calcolo</h2>
                <p className={styles.panelSubtitle}>
                  Breakdown completo dei valori per {selectedLabel.toLowerCase()}
                </p>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Voce</th>
                      <th>Categoria</th>
                      <th style={{ textAlign: "right" }}>Valore</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>
                        <div className={styles.cellPrimary}>
                          Ricavi ordini (preventivo)
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            borderColor: "#bfdbfe",
                          }}
                        >
                          Ricavo
                        </span>
                      </td>
                      <td
                        className={styles.mono}
                        style={{ textAlign: "right" }}
                      >
                        {formatEUR(data.ricaviOrdini)}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className={styles.cellPrimary}>
                          Ricavi montaggi (importo)
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            borderColor: "#bfdbfe",
                          }}
                        >
                          Ricavo
                        </span>
                      </td>
                      <td
                        className={styles.mono}
                        style={{ textAlign: "right" }}
                      >
                        {formatEUR(data.ricaviMontaggi)}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className={styles.cellPrimary}>
                          Costi extra (tabella costi)
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: "#fef2f2",
                            color: "#991b1b",
                            borderColor: "#fecaca",
                          }}
                        >
                          Costo
                        </span>
                      </td>
                      <td
                        className={styles.mono}
                        style={{ textAlign: "right" }}
                      >
                        {formatEUR(data.costiExtra)}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className={styles.cellPrimary}>
                          Costi ordini (costo)
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: "#fef2f2",
                            color: "#991b1b",
                            borderColor: "#fecaca",
                          }}
                        >
                          Costo
                        </span>
                      </td>
                      <td
                        className={styles.mono}
                        style={{ textAlign: "right" }}
                      >
                        {formatEUR(data.costiOrdini)}
                      </td>
                    </tr>
                  </tbody>

                  <tfoot>
                    <tr
                      style={{
                        borderTop: "2px solid #e2e8f0",
                      }}
                    >
                      <td colSpan={2}>
                        <div
                          className={styles.cellPrimary}
                          style={{ fontWeight: 900 }}
                        >
                          Totale (Ricavi − Costi)
                        </div>
                      </td>
                      <td
                        className={styles.mono}
                        style={{
                          textAlign: "right",
                          fontWeight: 900,
                          fontSize: "1.1rem",
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
