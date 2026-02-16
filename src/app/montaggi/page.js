"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/order-montaggi-list.module.css";

export default function MontaggiList() {
  const [montaggi, setMontaggi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortDataInizio, setSortDataInizio] = useState("none");
  const [sortImporto, setSortImporto] = useState("none");
  const [sortGiorniStimati, setSortGiorniStimati] = useState("none");
  const [filterTipologia, setFilterTipologia] = useState("tutti");

  const fetchMontaggi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/montaggi");
      if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
      const data = await response.json();
      setMontaggi(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Errore caricamento montaggi:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMontaggi();
  }, []);

  const handleDeleteMontaggio = async (id) => {
    try {
      const response = await fetch(`/api/montaggi/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Errore eliminazione montaggio");
      setMontaggi((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Errore eliminazione montaggio:", err);
    }
  };

  const nextSortState = (current) => {
    switch (current) {
      case "none":
        return "asc";
      case "asc":
        return "desc";
      case "desc":
        return "none";
      default:
        return "none";
    }
  };

  const handleDataInizioClick = () => {
    setSortDataInizio((prev) => nextSortState(prev));
    setSortImporto("none");
    setSortGiorniStimati("none");
  };

  const handleImportoClick = () => {
    setSortImporto((prev) => nextSortState(prev));
    setSortDataInizio("none");
    setSortGiorniStimati("none");
  };

  const handleGiorniStimatiClick = () => {
    setSortGiorniStimati((prev) => nextSortState(prev));
    setSortDataInizio("none");
    setSortImporto("none");
  };

  const filteredAndSortedMontaggi = useMemo(() => {
    let filtered = [...montaggi];

    if (filterTipologia !== "tutti") {
      filtered = filtered.filter(
        (m) => (m.tipologia || "").toLowerCase() === filterTipologia.toLowerCase()
      );
    }

    if (sortDataInizio !== "none") {
      filtered.sort((a, b) => {
        const aDate = a.data_inizio_stimata ? new Date(a.data_inizio_stimata) : new Date(0);
        const bDate = b.data_inizio_stimata ? new Date(b.data_inizio_stimata) : new Date(0);
        if (aDate < bDate) return sortDataInizio === "asc" ? -1 : 1;
        if (aDate > bDate) return sortDataInizio === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortImporto !== "none") {
      filtered.sort((a, b) => {
        const aImporto = parseFloat(a.importo);
        const bImporto = parseFloat(b.importo);
        if (aImporto < bImporto) return sortImporto === "asc" ? -1 : 1;
        if (aImporto > bImporto) return sortImporto === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortGiorniStimati !== "none") {
      filtered.sort((a, b) => {
        const aGiorni = parseInt(a.giorni_lavorativi_stimati, 10);
        const bGiorni = parseInt(b.giorni_lavorativi_stimati, 10);
        if (aGiorni < bGiorni) return sortGiorniStimati === "asc" ? -1 : 1;
        if (aGiorni > bGiorni) return sortGiorniStimati === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [montaggi, filterTipologia, sortDataInizio, sortImporto, sortGiorniStimati]);

  const tipologieList = useMemo(() => {
    const set = new Set();
    montaggi.forEach((m) => {
      if (m.tipologia) set.add(m.tipologia);
    });
    return Array.from(set).sort();
  }, [montaggi]);

  const getSortButtonClass = (state) => {
    switch (state) {
      case "asc":
        return `${styles.sortButton} ${styles.sortAsc}`;
      case "desc":
        return `${styles.sortButton} ${styles.sortDesc}`;
      case "none":
      default:
        return `${styles.sortButton} ${styles.sortNone}`;
    }
  };

  const total = filteredAndSortedMontaggi.length;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Montaggi</h1>
            <p className={styles.subheading}>Filtra e ordina i montaggi pianificati.</p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.counter}>
            Risultati: <strong>{total}</strong>
          </div>

          <div className={styles.toolbarActions}>
            <Link href="/montaggi/create" className={styles.primaryLink}>
              + Nuovo montaggio
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento montaggi...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBoxError}>
            <p>Errore nel caricamento dei montaggi: {error}</p>
          </div>
        ) : (
          <>
            <div className={styles.filtersContainer}>
              <div className={styles.sortButtons}>
                <button
                  type="button"
                  onClick={handleDataInizioClick}
                  className={getSortButtonClass(sortDataInizio)}
                  aria-pressed={sortDataInizio !== "none"}
                >
                  Data Inizio{" "}
                  {sortDataInizio === "asc" ? "↑" : sortDataInizio === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handleImportoClick}
                  className={getSortButtonClass(sortImporto)}
                  aria-pressed={sortImporto !== "none"}
                >
                  Importo{" "}
                  {sortImporto === "asc" ? "↑" : sortImporto === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handleGiorniStimatiClick}
                  className={getSortButtonClass(sortGiorniStimati)}
                  aria-pressed={sortGiorniStimati !== "none"}
                >
                  Giorni Stimati{" "}
                  {sortGiorniStimati === "asc"
                    ? "↑"
                    : sortGiorniStimati === "desc"
                    ? "↓"
                    : "—"}
                </button>
              </div>

              <div className={styles.filterSelects}>
                <div className={styles.filterGroup}>
                  <label htmlFor="filterTipologia">Tipologia</label>
                  <select
                    id="filterTipologia"
                    value={filterTipologia}
                    onChange={(e) => setFilterTipologia(e.target.value)}
                  >
                    <option value="tutti">Tutti</option>
                    {tipologieList.map((tipologia) => (
                      <option key={tipologia} value={tipologia}>
                        {tipologia}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredAndSortedMontaggi.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Venditore</th>
                      <th>Cliente</th>
                      <th>Indirizzo</th>
                      <th>Tipologia</th>
                      <th className={styles.colMoney}>Importo (€)</th>
                      <th className={styles.colSmall}>Giorni Stimati</th>
                      <th className={styles.colDate}>Data Inizio Stimata</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedMontaggi.map((montaggio) => (
                      <tr key={montaggio.id}>
                        <td className={`${styles.mono} ${styles.nowrap}`}>{montaggio.id}</td>

                        <td className={styles.cellWrap}>
                          {montaggio.venditore
                            ? `${montaggio.venditore.nome || ""} ${
                                montaggio.venditore.cognome || ""
                              }`.trim()
                            : "N/D"}
                        </td>

                        <td className={styles.cellWrap}>
                          {montaggio.cliente
                            ? `${montaggio.cliente.nome || ""} ${
                                montaggio.cliente.cognome || ""
                              }`.trim()
                            : "N/D"}
                        </td>

                        <td className={styles.cellWrap} title={montaggio.indirizzo || ""}>
                          {montaggio.indirizzo}
                        </td>

                        <td className={styles.cellWrap}>{montaggio.tipologia}</td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>
                          {Number(montaggio.importo).toFixed(2)}
                        </td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>
                          {montaggio.giorni_lavorativi_stimati}
                        </td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>
                          {montaggio.data_inizio_stimata
                            ? new Date(montaggio.data_inizio_stimata).toLocaleDateString("it-IT")
                            : "N/D"}
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteMontaggio(montaggio.id)}
                              className={styles.deleteButton}
                              aria-label={`Elimina montaggio ${montaggio.id}`}
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
                <p>Nessun montaggio trovato con i filtri selezionati</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
