"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2, Hammer, Euro, Calendar, TrendingUp } from "lucide-react";
import styles from "../../../styles/list.module.css";

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

      if (!response.ok) {
        throw new Error(`Errore HTTP! status: ${response.status}`);
      }

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
    const conferma = window.confirm(`Vuoi davvero eliminare il montaggio #${id}?`);
    if (!conferma) return;

    try {
      const response = await fetch(`/api/montaggi/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Errore eliminazione montaggio");
      }

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
        const aDate = a.data_inizio_stimata
          ? new Date(a.data_inizio_stimata)
          : new Date(0);
        const bDate = b.data_inizio_stimata
          ? new Date(b.data_inizio_stimata)
          : new Date(0);
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
    const base = styles.secondaryButton;
    if (state === "none") return base;
    return `${base} ${styles.sortActive}`;
  };

  const total = filteredAndSortedMontaggi.length;

  const totaleImporto = useMemo(() => {
    return filteredAndSortedMontaggi.reduce(
      (sum, m) => sum + parseFloat(m.importo || 0),
      0
    );
  }, [filteredAndSortedMontaggi]);

  const mediaGiorni = useMemo(() => {
    if (total === 0) return 0;
    const somma = filteredAndSortedMontaggi.reduce(
      (sum, m) => sum + parseInt(m.giorni_lavorativi_stimati || 0, 10),
      0
    );
    return Math.round(somma / total);
  }, [filteredAndSortedMontaggi, total]);

  const prossimiMontaggi = useMemo(() => {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return montaggi.filter((m) => {
      if (!m.data_inizio_stimata) return false;
      const date = new Date(m.data_inizio_stimata);
      return date >= now && date <= futureLimit;
    }).length;
  }, [montaggi]);

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
            <p className={styles.pageEyebrow}>Montaggi</p>
            <h1 className={styles.heading}>Pianificazione montaggi</h1>
            <p className={styles.subheading}>
              Gestisci i lavori programmati, filtra per tipologia, ordina per data,
              importo o durata stimata.
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
            <p>Errore nel caricamento dei montaggi: {error}</p>
          </div>
        ) : null}

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Hammer size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Montaggi totali</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>
                Lavori programmati in pipeline
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Euro size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Valore totale</p>
              <h3 className={styles.statValue}>
                {formatCurrency(totaleImporto)}
              </h3>
              <p className={styles.statMeta}>Importo complessivo filtrato</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Prossimi 30 giorni</p>
              <h3 className={styles.statValue}>{prossimiMontaggi}</h3>
              <p className={styles.statMeta}>
                Montaggi in partenza a breve
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/montaggi/create" className={styles.primaryLink}>
              + Nuovo montaggio
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento montaggi...</p>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Filtri e ordinamento</h2>
                <p className={styles.panelSubtitle}>
                  Affina la ricerca per tipologia e ordina per criteri multipli.
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
                  <option value="tutti">Tutte le tipologie</option>
                  {tipologieList.map((tipologia) => (
                    <option key={tipologia} value={tipologia}>
                      {tipologia}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Ordinamento</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleDataInizioClick}
                    className={getSortButtonClass(sortDataInizio)}
                    aria-pressed={sortDataInizio !== "none"}
                  >
                    Data{" "}
                    {sortDataInizio === "asc"
                      ? "↑"
                      : sortDataInizio === "desc"
                      ? "↓"
                      : "—"}
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
                    Giorni{" "}
                    {sortGiorniStimati === "asc"
                      ? "↑"
                      : sortGiorniStimati === "desc"
                      ? "↓"
                      : "—"}
                  </button>
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
                      <th>Importo</th>
                      <th>Giorni</th>
                      <th>Data inizio</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedMontaggi.map((montaggio) => (
                      <tr key={montaggio.id}>
                        <td className={styles.mono}>{montaggio.id}</td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {montaggio.venditore
                              ? `${montaggio.venditore.nome || ""} ${
                                  montaggio.venditore.cognome || ""
                                }`.trim()
                              : "N/D"}
                          </div>
                          <div className={styles.cellSecondary}>
                            Venditore #{montaggio.venditore_id || "-"}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {montaggio.cliente
                              ? `${montaggio.cliente.nome || ""} ${
                                  montaggio.cliente.cognome || ""
                                }`.trim()
                              : "N/D"}
                          </div>
                          <div className={styles.cellSecondary}>
                            Cliente #{montaggio.cliente_id || "-"}
                          </div>
                        </td>

                        <td
                          className={styles.cellWrap}
                          title={montaggio.indirizzo || ""}
                        >
                          {montaggio.indirizzo || "-"}
                        </td>

                        <td>
                          <span className={styles.contactPill}>
                            {montaggio.tipologia}
                          </span>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {formatCurrency(Number(montaggio.importo || 0))}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {montaggio.giorni_lavorativi_stimati} gg
                          </div>
                        </td>

                        <td>
                          <span className={styles.contactPill}>
                            {montaggio.data_inizio_stimata
                              ? new Date(
                                  montaggio.data_inizio_stimata
                                ).toLocaleDateString("it-IT")
                              : "N/D"}
                          </span>
                        </td>

                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteMontaggio(montaggio.id)}
                              className={styles.iconDangerButton}
                              aria-label={`Elimina montaggio ${montaggio.id}`}
                              title="Elimina montaggio"
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
                <p>Nessun montaggio trovato con i filtri selezionati</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
