"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Receipt, TrendingDown, Calendar } from "lucide-react";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

function toMonthString(dateYYYYMMDD) {
  if (!dateYYYYMMDD || typeof dateYYYYMMDD !== "string") return "";
  return dateYYYYMMDD.slice(0, 7);
}

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

export default function CostiList() {
  const [costi, setCosti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterTipologia, setFilterTipologia] = useState("tutti");
  const [filterYear, setFilterYear] = useState("tutti");
  const [filterMonth, setFilterMonth] = useState("tutti");

  const fetchCosti = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/costi", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Errore HTTP! status: ${response.status}`);
      }

      const data = await response.json();
      setCosti(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Errore caricamento costi:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosti();
  }, []);

  const handleDeleteCosto = async (id) => {
    const conferma = window.confirm(`Vuoi davvero eliminare il costo #${id}?`);
    if (!conferma) return;

    try {
      setError(null);

      const response = await fetch(`/api/costi/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Errore eliminazione costo");
      }

      setCosti((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Errore eliminazione costo:", err);
      setError(`Errore nell'eliminazione del costo: ${err.message}`);
    }
  };

  const tipologieList = useMemo(() => {
    const set = new Set();
    costi.forEach((c) => {
      if (c.tipologia) set.add(c.tipologia);
    });
    return Array.from(set).sort();
  }, [costi]);

  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  }, []);

  const filteredCosti = useMemo(() => {
    let filtered = [...costi];

    if (filterTipologia !== "tutti") {
      filtered = filtered.filter(
        (c) =>
          String(c.tipologia || "").toLowerCase() ===
          filterTipologia.toLowerCase()
      );
    }

    if (filterYear !== "tutti") {
      filtered = filtered.filter((c) =>
        String(c.data || "").startsWith(`${filterYear}-`)
      );
    }

    if (filterYear !== "tutti" && filterMonth !== "tutti") {
      const ym = `${filterYear}-${filterMonth}`;
      filtered = filtered.filter((c) => toMonthString(c.data) === ym);
    }

    filtered.sort((a, b) => {
      const aDate = String(a.data || "");
      const bDate = String(b.data || "");
      if (aDate < bDate) return 1;
      if (aDate > bDate) return -1;
      return Number(b.id) - Number(a.id);
    });

    return filtered;
  }, [costi, filterTipologia, filterYear, filterMonth]);

  const total = filteredCosti.length;

  const totaleEuro = useMemo(() => {
    return filteredCosti.reduce((sum, c) => sum + Number(c.prezzo || 0), 0);
  }, [filteredCosti]);

  const mediaEuro = useMemo(() => {
    if (total === 0) return 0;
    return totaleEuro / total;
  }, [totaleEuro, total]);

  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    return costi
      .filter((c) => toMonthString(c.data) === ym)
      .reduce((sum, c) => sum + Number(c.prezzo || 0), 0);
  }, [costi]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Costi</p>
            <h1 className={styles.heading}>Registro spese</h1>
            <p className={styles.subheading}>
              Monitora e gestisci le spese aziendali con filtri per periodo,
              categoria e analisi aggregate automatiche.
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
              <Receipt size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Totale registrato</p>
              <h3 className={styles.statValue}>{formatCurrency(totaleEuro)}</h3>
              <p className={styles.statMeta}>
                Somma di {total} {total === 1 ? "costo" : "costi"} filtrati
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingDown size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Media per voce</p>
              <h3 className={styles.statValue}>{formatCurrency(mediaEuro)}</h3>
              <p className={styles.statMeta}>Costo medio unitario calcolato</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Mese corrente</p>
              <h3 className={styles.statValue}>
                {formatCurrency(currentMonthTotal)}
              </h3>
              <p className={styles.statMeta}>
                Spese registrate nel mese in corso
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/costi/create" className={styles.primaryLink}>
              + Nuovo costo
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento costi...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBoxError}>
            <p>Errore: {error}</p>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Filtri avanzati</h2>
                <p className={styles.panelSubtitle}>
                  Affina la ricerca per categoria, anno e mese specifico.
                </p>
              </div>
            </div>

            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label htmlFor="filterTipologia">Tipologia</label>
                <select
                  id="filterTipologia"
                  value={filterTipologia}
                  onChange={(e) => setFilterTipologia(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="tutti">Tutte le categorie</option>
                  {tipologieList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterYear">Anno</label>
                <select
                  id="filterYear"
                  value={filterYear}
                  onChange={(e) => {
                    const y = e.target.value;
                    setFilterYear(y);
                    setFilterMonth("tutti");
                  }}
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
                  onChange={(e) => setFilterMonth(e.target.value)}
                  disabled={filterYear === "tutti"}
                  title={
                    filterYear === "tutti" ? "Seleziona prima un anno" : ""
                  }
                  className={styles.filterSelect}
                >
                  <option value="tutti">
                    {filterYear === "tutti"
                      ? "Seleziona prima l'anno"
                      : "Tutti i mesi"}
                  </option>
                  {MESI.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredCosti.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Tipologia</th>
                      <th>Data</th>
                      <th>Importo</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCosti.map((c) => (
                      <tr key={c.id}>
                        <td className={styles.mono}>{c.id}</td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {c.tipologia}
                          </div>
                          <div className={styles.cellSecondary}>
                            Costo #{c.id}
                          </div>
                        </td>

                        <td>
                          <span className={styles.contactPill}>{c.data}</span>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {formatCurrency(Number(c.prezzo || 0))}
                          </div>
                        </td>

                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteCosto(c.id)}
                              className={styles.iconDangerButton}
                              aria-label={`Elimina costo ${c.id}`}
                              title="Elimina costo"
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
            ) : (
              <div className={styles.stateBox} style={{ marginTop: "1rem" }}>
                <p>Nessun costo trovato con i filtri selezionati</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
