"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/order-montaggi-list.module.css";

function toMonthString(dateYYYYMMDD) {
  if (!dateYYYYMMDD || typeof dateYYYYMMDD !== "string") return "";
  return dateYYYYMMDD.slice(0, 7); // YYYY-MM
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

  // filtri
  const [filterTipologia, setFilterTipologia] = useState("tutti");
  const [filterYear, setFilterYear] = useState("tutti"); // es. "2026"
  const [filterMonth, setFilterMonth] = useState("tutti"); // "01".."12"

  const fetchCosti = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/costi", { cache: "no-store" });
      if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
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
    try {
      setError(null);
      const response = await fetch(`/api/costi/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Errore eliminazione costo");
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
    const currentYear = new Date().getFullYear(); // anno corrente [web:306]
    return Array.from({ length: 6 }, (_, i) => String(currentYear - i)); // 0..5
  }, []);

  const filteredCosti = useMemo(() => {
    let filtered = [...costi];

    if (filterTipologia !== "tutti") {
      filtered = filtered.filter(
        (c) => String(c.tipologia || "").toLowerCase() === filterTipologia.toLowerCase()
      );
    }

    // anno
    if (filterYear !== "tutti") {
      filtered = filtered.filter((c) => String(c.data || "").startsWith(`${filterYear}-`));
    }

    // mese (solo se anno selezionato)
    if (filterYear !== "tutti" && filterMonth !== "tutti") {
      const ym = `${filterYear}-${filterMonth}`; // YYYY-MM [web:291]
      filtered = filtered.filter((c) => toMonthString(c.data) === ym);
    }

    // ordinamento: data desc, id desc
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

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Costi</h1>
            <p className={styles.subheading}>Filtra e visualizza i costi registrati.</p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.counter}>
            Risultati: <strong>{total}</strong> — Somma:{" "}
            <strong>
              {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
                totaleEuro
              )}
            </strong>
          </div>

          <div className={styles.toolbarActions}>
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
          <>
            <div className={styles.filtersContainer}>
              <div className={styles.filterSelects}>
                <div className={styles.filterGroup}>
                  <label htmlFor="filterTipologia">Tipologia</label>
                  <select
                    id="filterTipologia"
                    value={filterTipologia}
                    onChange={(e) => setFilterTipologia(e.target.value)}
                  >
                    <option value="tutti">Tutti</option>
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
                      setFilterMonth("tutti"); // reset mese quando cambia anno
                    }}
                  >
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
                    onChange={(e) => setFilterMonth(e.target.value)}
                    disabled={filterYear === "tutti"}
                    title={filterYear === "tutti" ? "Seleziona prima un anno" : ""}
                  >
                    <option value="tutti">
                      {filterYear === "tutti" ? "Seleziona anno" : "Tutti"}
                    </option>
                    {MESI.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredCosti.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Tipologia</th>
                      <th className={styles.colDate}>Data</th>
                      <th className={styles.colMoney}>Prezzo (€)</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCosti.map((c) => (
                      <tr key={c.id}>
                        <td className={`${styles.mono} ${styles.nowrap}`}>{c.id}</td>
                        <td className={styles.cellWrap}>{c.tipologia}</td>
                        <td className={`${styles.mono} ${styles.nowrap}`}>{c.data}</td>
                        <td className={`${styles.mono} ${styles.nowrap}`}>
                          {new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(Number(c.prezzo || 0))}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteCosto(c.id)}
                              className={styles.deleteButton}
                              aria-label={`Elimina costo ${c.id}`}
                              title="Elimina"
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
                <p>Nessun costo trovato con i filtri selezionati</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
