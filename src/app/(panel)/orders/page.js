"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, Euro, Package, TrendingUp } from "lucide-react";
import styles from "../../../styles/list.module.css";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortDate, setSortDate] = useState("none");
  const [sortPrice, setSortPrice] = useState("none");
  const [sortPreventivo, setSortPreventivo] = useState("none");
  const [sortColli, setSortColli] = useState("none");

  const [filterStatus, setFilterStatus] = useState("tutti");
  const [filterSeller, setFilterSeller] = useState("tutti");
  const [filterClient, setFilterClient] = useState("tutti");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/orders", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Errore HTTP! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Errore caricamento ordini:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleDeliveryStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus.toLowerCase() === "consegnato" ? "In Lavorazione" : "Consegnato";

    try {
      setError(null);

      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato: newStatus }),
      });

      if (!response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {}
        throw new Error(
          data?.error || `Errore durante l'aggiornamento dello stato: ${response.status}`
        );
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, stato: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Errore nel cambio stato:", err);
      setError(`Errore nel cambio stato: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (id) => {
    const conferma = window.confirm(`Vuoi davvero eliminare l'ordine #${id}?`);
    if (!conferma) return;

    try {
      setError(null);

      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });

      if (!response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {}
        throw new Error(data?.error || "Errore eliminazione ordine");
      }

      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      console.error("Errore eliminazione ordine:", err);
      setError(`Errore nell'eliminazione dell'ordine: ${err.message}`);
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

  const handleDateClick = () => {
    setSortDate((prev) => nextSortState(prev));
    setSortPrice("none");
    setSortPreventivo("none");
    setSortColli("none");
  };

  const handlePriceClick = () => {
    setSortPrice((prev) => nextSortState(prev));
    setSortDate("none");
    setSortPreventivo("none");
    setSortColli("none");
  };

  const handlePreventivoClick = () => {
    setSortPreventivo((prev) => nextSortState(prev));
    setSortDate("none");
    setSortPrice("none");
    setSortColli("none");
  };

  const handleColliClick = () => {
    setSortColli((prev) => nextSortState(prev));
    setSortDate("none");
    setSortPrice("none");
    setSortPreventivo("none");
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    if (filterStatus !== "tutti") {
      filtered = filtered.filter(
        (o) => o.stato.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (filterSeller !== "tutti") {
      filtered = filtered.filter((o) => {
        const sellerName = `${o.venditore_nome} ${o.venditore_cognome}`;
        return sellerName === filterSeller;
      });
    }

    if (filterClient !== "tutti") {
      filtered = filtered.filter((o) => {
        const clientName = `${o.cliente_nome} ${o.cliente_cognome}`;
        return clientName === filterClient;
      });
    }

    if (sortDate !== "none") {
      filtered.sort((a, b) => {
        const aDate = new Date(a.data_ordine);
        const bDate = new Date(b.data_ordine);
        if (aDate < bDate) return sortDate === "asc" ? -1 : 1;
        if (aDate > bDate) return sortDate === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortPrice !== "none") {
      filtered.sort((a, b) => {
        const aPrice = Number(a.costo ?? 0);
        const bPrice = Number(b.costo ?? 0);
        if (aPrice < bPrice) return sortPrice === "asc" ? -1 : 1;
        if (aPrice > bPrice) return sortPrice === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortPreventivo !== "none") {
      filtered.sort((a, b) => {
        const aPrev = Number(a.preventivo ?? 0);
        const bPrev = Number(b.preventivo ?? 0);
        if (aPrev < bPrev) return sortPreventivo === "asc" ? -1 : 1;
        if (aPrev > bPrev) return sortPreventivo === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortColli !== "none") {
      filtered.sort((a, b) => {
        const aColli = Number(a.numero_colli ?? 0);
        const bColli = Number(b.numero_colli ?? 0);
        if (aColli < bColli) return sortColli === "asc" ? -1 : 1;
        if (aColli > bColli) return sortColli === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    orders,
    filterStatus,
    filterSeller,
    filterClient,
    sortDate,
    sortPrice,
    sortPreventivo,
    sortColli,
  ]);

  const sellersList = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => set.add(`${o.venditore_nome} ${o.venditore_cognome}`));
    return Array.from(set).sort();
  }, [orders]);

  const clientsList = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => set.add(`${o.cliente_nome} ${o.cliente_cognome}`));
    return Array.from(set).sort();
  }, [orders]);

  const getSortButtonClass = (state) => {
    const base = styles.secondaryButton;
    if (state === "none") return base;
    return `${base} ${styles.sortActive}`;
  };

  const total = filteredAndSortedOrders.length;

  const totaleCosto = useMemo(() => {
    return filteredAndSortedOrders.reduce(
      (sum, o) => sum + Number(o.costo || 0),
      0
    );
  }, [filteredAndSortedOrders]);

  const totalePreventivo = useMemo(() => {
    return filteredAndSortedOrders.reduce(
      (sum, o) => sum + Number(o.preventivo || 0),
      0
    );
  }, [filteredAndSortedOrders]);

  const consegnatiCount = useMemo(() => {
    return orders.filter((o) => o.stato.toLowerCase() === "consegnato").length;
  }, [orders]);

  const inLavorazioneCount = useMemo(() => {
    return orders.filter((o) => o.stato.toLowerCase() === "in lavorazione")
      .length;
  }, [orders]);

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
            <p className={styles.pageEyebrow}>Ordini</p>
            <h1 className={styles.heading}>Gestione ordini</h1>
            <p className={styles.subheading}>
              Monitora ordini attivi e consegnati, gestisci stati, filtra per
              venditore, cliente e criterio economico.
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

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Ordini totali</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>
                {inLavorazioneCount} in lavorazione, {consegnatiCount} consegnati
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Euro size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Valore costi</p>
              <h3 className={styles.statValue}>
                {formatCurrency(totaleCosto)}
              </h3>
              <p className={styles.statMeta}>Somma costi ordini filtrati</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Valore preventivi</p>
              <h3 className={styles.statValue}>
                {formatCurrency(totalePreventivo)}
              </h3>
              <p className={styles.statMeta}>Somma preventivi ordini filtrati</p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/orders/create" className={styles.primaryLink}>
              + Nuovo ordine
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento ordini...</p>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Filtri e ordinamento</h2>
                <p className={styles.panelSubtitle}>
                  Affina per stato, venditore, cliente. Ordina per data, costi,
                  preventivo o colli.
                </p>
              </div>
            </div>

            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label htmlFor="filterStatus">Stato</label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="tutti">Tutti gli stati</option>
                  <option value="in lavorazione">In Lavorazione</option>
                  <option value="consegnato">Consegnato</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterSeller">Venditore</label>
                <select
                  id="filterSeller"
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="tutti">Tutti i venditori</option>
                  {sellersList.map((seller) => (
                    <option key={seller} value={seller}>
                      {seller}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterClient">Cliente</label>
                <select
                  id="filterClient"
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="tutti">Tutti i clienti</option>
                  {clientsList.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                padding: "1rem 1.2rem",
                borderBottom: "1px solid #eef2f7",
                background: "rgba(248, 250, 252, 0.5)",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <label
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  Ordinamento
                </label>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleDateClick}
                  className={getSortButtonClass(sortDate)}
                  aria-pressed={sortDate !== "none"}
                >
                  Data {sortDate === "asc" ? "↑" : sortDate === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handlePriceClick}
                  className={getSortButtonClass(sortPrice)}
                  aria-pressed={sortPrice !== "none"}
                >
                  Costo{" "}
                  {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handlePreventivoClick}
                  className={getSortButtonClass(sortPreventivo)}
                  aria-pressed={sortPreventivo !== "none"}
                >
                  Preventivo{" "}
                  {sortPreventivo === "asc"
                    ? "↑"
                    : sortPreventivo === "desc"
                    ? "↓"
                    : "—"}
                </button>

                <button
                  type="button"
                  onClick={handleColliClick}
                  className={getSortButtonClass(sortColli)}
                  aria-pressed={sortColli !== "none"}
                >
                  Colli{" "}
                  {sortColli === "asc" ? "↑" : sortColli === "desc" ? "↓" : "—"}
                </button>
              </div>
            </div>

            {filteredAndSortedOrders.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Venditore</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Costo</th>
                      <th>Preventivo</th>
                      <th>Colli</th>
                      <th>Destinazione</th>
                      <th>Disegno</th>
                      <th>Stato</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className={styles.mono}>{order.id}</td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {order.venditore_nome} {order.venditore_cognome}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {order.cliente_nome} {order.cliente_cognome}
                          </div>
                        </td>

                        <td>
                          <span className={styles.contactPill}>
                            {order.data_ordine}
                          </span>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {formatCurrency(Number(order.costo || 0))}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {order.preventivo
                              ? formatCurrency(Number(order.preventivo))
                              : "-"}
                          </div>
                        </td>

                        <td>
                          <div className={styles.cellPrimary}>
                            {order.numero_colli}
                          </div>
                        </td>

                        <td
                          className={styles.cellWrap}
                          title={order.destinazione || ""}
                        >
                          {order.destinazione}
                        </td>

                        <td>
                          {order.disegno_path ? (
                            <a
                              href={`/orders/disegno?src=${encodeURIComponent(
                                order.disegno_path
                              )}&cliente=${encodeURIComponent(
                                `${order.cliente_nome} ${order.cliente_cognome}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.secondaryButton}
                              style={{
                                fontSize: "0.85rem",
                                padding: "0.5rem 0.75rem",
                              }}
                              title="Apri disegno in una nuova scheda"
                            >
                              Vedi
                            </a>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              toggleDeliveryStatus(order.id, order.stato)
                            }
                            className={`${styles.statusBadge} ${
                              order.stato.toLowerCase() === "consegnato"
                                ? styles.statusFuture
                                : styles.statusToday
                            }`}
                            title="Clicca per cambiare stato"
                          >
                            {order.stato}
                          </button>
                        </td>

                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className={styles.iconDangerButton}
                              aria-label={`Elimina ordine ${order.id}`}
                              title="Elimina ordine"
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
                <p>Nessun ordine trovato con i filtri selezionati</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
