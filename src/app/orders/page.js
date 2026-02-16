"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "../../styles/order-montaggi-list.module.css";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortDate, setSortDate] = useState("none");
  const [sortPrice, setSortPrice] = useState("none"); // totale
  const [sortPreventivo, setSortPreventivo] = useState("none"); // nuovo
  const [sortColli, setSortColli] = useState("none");

  const [filterStatus, setFilterStatus] = useState("tutti");
  const [filterSeller, setFilterSeller] = useState("tutti");
  const [filterClient, setFilterClient] = useState("tutti");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
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
        prev.map((order) => (order.id === id ? { ...order, stato: newStatus } : order))
      );
    } catch (err) {
      console.error("Errore nel cambio stato:", err);
      setError(`Errore nel cambio stato: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (id) => {
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
      filtered = filtered.filter((o) => o.stato.toLowerCase() === filterStatus.toLowerCase());
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

  const total = filteredAndSortedOrders.length;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Elenco Ordini</h1>
            <p className={styles.subheading}>Filtra, ordina e aggiorna lo stato degli ordini.</p>
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
            <Link href="/orders/create" className={styles.primaryLink}>
              + Nuovo ordine
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento ordini...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBoxError}>
            <p>Errore: {error}</p>
          </div>
        ) : (
          <>
            <div className={styles.filtersContainer}>
              <div className={styles.sortButtons}>
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
                  Costo {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handlePreventivoClick}
                  className={getSortButtonClass(sortPreventivo)}
                  aria-pressed={sortPreventivo !== "none"}
                >
                  Preventivo{" "}
                  {sortPreventivo === "asc" ? "↑" : sortPreventivo === "desc" ? "↓" : "—"}
                </button>

                <button
                  type="button"
                  onClick={handleColliClick}
                  className={getSortButtonClass(sortColli)}
                  aria-pressed={sortColli !== "none"}
                >
                  Colli {sortColli === "asc" ? "↑" : sortColli === "desc" ? "↓" : "—"}
                </button>
              </div>

              <div className={styles.filterSelects}>
                <div className={styles.filterGroup}>
                  <label htmlFor="filterStatus">Stato</label>
                  <select
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="tutti">Tutti</option>
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
                  >
                    <option value="tutti">Tutti</option>
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
                  >
                    <option value="tutti">Tutti</option>
                    {clientsList.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>
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
                      <th className={styles.colDate}>Data</th>
                      <th className={styles.colMoney}>Costo (€)</th>
                      <th className={styles.colMoney}>Preventivo (€)</th>
                      <th className={styles.colSmall}>Colli</th>
                      <th>Destinazione</th>
                      <th>Disegno</th>
                      <th className={styles.colStatus}>Stato</th>
                      <th className={styles.colActions}>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className={`${styles.mono} ${styles.nowrap}`}>{order.id}</td>

                        <td className={styles.cellWrap}>
                          {order.venditore_nome} {order.venditore_cognome}
                        </td>

                        <td className={styles.cellWrap}>
                          {order.cliente_nome} {order.cliente_cognome}
                        </td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>{order.data_ordine}</td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>{order.costo}</td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>
                          {order.preventivo ?? "-"}
                        </td>

                        <td className={`${styles.mono} ${styles.nowrap}`}>{order.numero_colli}</td>

                        <td className={styles.cellWrap} title={order.destinazione || ""}>
                          {order.destinazione}
                        </td>

                        {/* Disegno: ORA apre una nuova pagina fullscreen */}
                        <td className={styles.nowrap}>
                          {order.disegno_path ? (
                            <a
                              href={`/orders/disegno?src=${encodeURIComponent(order.disegno_path)}&cliente=${encodeURIComponent(`${order.cliente_nome} ${order.cliente_cognome}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.primaryLink}
                              title="Apri disegno in una nuova scheda"
                            >
                              Vedi
                            </a>
                          ) : (
                            <span className={styles.mono}>—</span>
                          )}
                        </td>


                        <td className={styles.nowrap}>
                          <button
                            type="button"
                            onClick={() => toggleDeliveryStatus(order.id, order.stato)}
                            className={styles.statusButton}
                            data-status={order.stato.toLowerCase()}
                            title="Clicca per cambiare stato"
                          >
                            {order.stato}
                          </button>
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className={styles.deleteButton}
                              aria-label={`Elimina ordine ${order.id}`}
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
                <p>Nessun ordine trovato con i filtri selezionati</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
