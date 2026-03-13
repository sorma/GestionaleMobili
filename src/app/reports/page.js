"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import styles from "../../styles/reports.module.css";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("orders_by_seller");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [openSellerId, setOpenSellerId] = useState(null);
  const [openClientId, setOpenClientId] = useState(null);
  const [openMonth, setOpenMonth] = useState(null);

  const [sellerDetails, setSellerDetails] = useState({});
  const [clientDetails, setClientDetails] = useState({});
  const [monthDetails, setMonthDetails] = useState({});

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(`/api/reports?type=${reportType}`, {
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || `Errore HTTP! status: ${response.status}`);
        }

        setReportData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Errore durante il recupero del report:", err);
        setReportData([]);
        setMessage(`Impossibile caricare il report: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
    setOpenSellerId(null);
    setOpenClientId(null);
    setOpenMonth(null);
  }, [reportType]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
      value
    );

  const sellers = useMemo(() => {
    return reportData.reduce((acc, item) => {
      if (item?.seller_id && item?.seller_name && item?.seller_lastname) {
        const key = item.seller_id;
        if (!acc[key]) {
          acc[key] = {
            name: `${item.seller_name} ${item.seller_lastname}`,
            id: item.seller_id,
            total_orders: item.total_orders,
            total_cost: item.total_cost,
            total_quote: item.total_quote,
            total_profit: item.total_profit,
          };
        }
      }
      return acc;
    }, {});
  }, [reportData]);

  const clients = useMemo(() => {
    return reportData.reduce((acc, item) => {
      if (item?.client_id && item?.client_name && item?.client_lastname) {
        const key = item.client_id;
        if (!acc[key]) {
          acc[key] = {
            name: `${item.client_name} ${item.client_lastname}`,
            id: item.client_id,
            total_orders: item.total_orders,
            total_cost: item.total_cost,
            total_quote: item.total_quote,
            total_profit: item.total_profit,
          };
        }
      }
      return acc;
    }, {});
  }, [reportData]);

  const totalOrders = useMemo(() => {
    if (reportType === "orders_by_seller") {
      return Object.values(sellers).reduce((sum, s) => sum + s.total_orders, 0);
    } else if (reportType === "orders_by_client") {
      return Object.values(clients).reduce((sum, c) => sum + c.total_orders, 0);
    } else {
      return reportData.reduce((sum, item) => sum + item.total_orders, 0);
    }
  }, [reportType, sellers, clients, reportData]);

  const totalProfit = useMemo(() => {
    if (reportType === "orders_by_seller") {
      return Object.values(sellers).reduce((sum, s) => sum + s.total_profit, 0);
    } else if (reportType === "orders_by_client") {
      return Object.values(clients).reduce((sum, c) => sum + c.total_profit, 0);
    } else {
      return reportData.reduce((sum, item) => sum + item.total_profit, 0);
    }
  }, [reportType, sellers, clients, reportData]);

  const entitiesCount = useMemo(() => {
    if (reportType === "orders_by_seller") {
      return Object.keys(sellers).length;
    } else if (reportType === "orders_by_client") {
      return Object.keys(clients).length;
    } else {
      return reportData.length;
    }
  }, [reportType, sellers, clients, reportData]);

  async function loadSellerDetail(sellerId) {
    if (sellerDetails[sellerId]?.rows) return;

    setSellerDetails((prev) => ({
      ...prev,
      [sellerId]: { loading: true, error: "", rows: [] },
    }));

    try {
      const res = await fetch(
        `/api/reports?type=orders_detail_by_seller&seller_id=${sellerId}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setSellerDetails((prev) => ({
        ...prev,
        [sellerId]: {
          loading: false,
          error: "",
          rows: Array.isArray(json) ? json : [],
        },
      }));
    } catch (e) {
      setSellerDetails((prev) => ({
        ...prev,
        [sellerId]: { loading: false, error: e.message, rows: [] },
      }));
    }
  }

  async function loadClientDetail(clientId) {
    if (clientDetails[clientId]?.rows) return;

    setClientDetails((prev) => ({
      ...prev,
      [clientId]: { loading: true, error: "", rows: [] },
    }));

    try {
      const res = await fetch(
        `/api/reports?type=orders_detail_by_client&client_id=${clientId}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setClientDetails((prev) => ({
        ...prev,
        [clientId]: {
          loading: false,
          error: "",
          rows: Array.isArray(json) ? json : [],
        },
      }));
    } catch (e) {
      setClientDetails((prev) => ({
        ...prev,
        [clientId]: { loading: false, error: e.message, rows: [] },
      }));
    }
  }

  async function loadMonthDetail(month) {
    if (monthDetails[month]?.rows) return;

    setMonthDetails((prev) => ({
      ...prev,
      [month]: { loading: true, error: "", rows: [] },
    }));

    try {
      const res = await fetch(
        `/api/reports?type=orders_detail_by_month&month=${encodeURIComponent(month)}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setMonthDetails((prev) => ({
        ...prev,
        [month]: {
          loading: false,
          error: "",
          rows: Array.isArray(json) ? json : [],
        },
      }));
    } catch (e) {
      setMonthDetails((prev) => ({
        ...prev,
        [month]: { loading: false, error: e.message, rows: [] },
      }));
    }
  }

  const getReportTitle = () => {
    switch (reportType) {
      case "orders_by_seller":
        return "Ordini per venditore";
      case "orders_by_client":
        return "Ordini per cliente";
      case "sales_over_time_monthly":
        return "Andamento mensile";
      default:
        return "Report ordini";
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case "orders_by_seller":
        return "Analisi aggregata degli ordini raggruppati per venditore con dettagli espandibili.";
      case "orders_by_client":
        return "Distribuzione degli ordini per cliente con metriche di guadagno associate.";
      case "sales_over_time_monthly":
        return "Evoluzione temporale delle vendite con aggregazione mensile e trend di guadagno.";
      default:
        return "";
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Analytics</p>
            <h1 className={styles.heading}>Report Ordini</h1>
            <p className={styles.subheading}>
              Analisi aggregata con drill-down su venditori, clienti e andamento temporale.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {message ? (
          <div className={styles.stateBoxError}>{message}</div>
        ) : null}

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <BarChart3 size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Totale ordini</p>
              <h3 className={styles.statValue}>{totalOrders}</h3>
              <p className={styles.statMeta}>Aggregato dal report corrente</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Guadagno totale</p>
              <h3 className={styles.statValue}>{formatCurrency(totalProfit)}</h3>
              <p className={styles.statMeta}>Somma profitti registrati</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              {reportType === "sales_over_time_monthly" ? (
                <Calendar size={18} />
              ) : (
                <Users size={18} />
              )}
            </div>
            <div>
              <p className={styles.statLabel}>
                {reportType === "orders_by_seller"
                  ? "Venditori"
                  : reportType === "orders_by_client"
                  ? "Clienti"
                  : "Periodi"}
              </p>
              <h3 className={styles.statValue}>{entitiesCount}</h3>
              <p className={styles.statMeta}>
                {reportType === "sales_over_time_monthly"
                  ? "Mesi con attività"
                  : "Entità registrate"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>Caricamento report…</div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>{getReportTitle()}</h2>
                <p className={styles.panelSubtitle}>{getReportDescription()}</p>
              </div>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={styles.reportSelector}
                aria-label="Seleziona tipo di report"
              >
                <option value="orders_by_seller">Per Venditore</option>
                <option value="orders_by_client">Per Cliente</option>
                <option value="sales_over_time_monthly">Andamento Mensile</option>
              </select>
            </div>

            {reportType === "orders_by_seller" ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Venditore</th>
                      <th>Ordini</th>
                      <th>Costo</th>
                      <th>Preventivo</th>
                      <th>Guadagno</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.values(sellers).map((s) => {
                      const isOpen = openSellerId === s.id;
                      const detail = sellerDetails[s.id];

                      return (
                        <React.Fragment key={s.id}>
                          <tr
                            className={
                              s.total_orders > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (s.total_orders > 1) {
                                const next = isOpen ? null : s.id;
                                setOpenSellerId(next);
                                if (!isOpen) loadSellerDetail(s.id);
                              }
                            }}
                            title={
                              s.total_orders > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td className={styles.mono}>{s.id}</td>
                            <td>
                              <div className={styles.cellPrimary}>{s.name}</div>
                              {s.total_orders > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{s.total_orders}</td>
                            <td className={styles.mono}>
                              {formatCurrency(s.total_cost)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(s.total_quote)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(s.total_profit)}
                            </td>
                          </tr>

                          {s.total_orders > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={6} className={styles.detailCell}>
                                {detail?.loading ? (
                                  <div className={styles.stateBox}>
                                    Caricamento dettagli…
                                  </div>
                                ) : detail?.error ? (
                                  <div className={styles.stateBoxError}>
                                    Errore: {detail.error}
                                  </div>
                                ) : (
                                  <table className={styles.detailTable}>
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Destinazione</th>
                                        <th>Colli</th>
                                        <th>Stato</th>
                                        <th>Costo</th>
                                        <th>Preventivo</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((o) => (
                                        <tr key={o.order_id}>
                                          <td className={styles.mono}>
                                            {o.order_id}
                                          </td>
                                          <td>{o.data_ordine}</td>
                                          <td className={styles.cellWrap}>
                                            {o.destinazione}
                                          </td>
                                          <td className={styles.mono}>
                                            {o.numero_colli}
                                          </td>
                                          <td>{o.stato}</td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.costo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.preventivo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.guadagno)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {Object.keys(sellers).length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.stateBox}>
                          Nessun dato disponibile
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : reportType === "orders_by_client" ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Cliente</th>
                      <th>Ordini</th>
                      <th>Costo</th>
                      <th>Preventivo</th>
                      <th>Guadagno</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.values(clients).map((c) => {
                      const isOpen = openClientId === c.id;
                      const detail = clientDetails[c.id];

                      return (
                        <React.Fragment key={c.id}>
                          <tr
                            className={
                              c.total_orders > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (c.total_orders > 1) {
                                const next = isOpen ? null : c.id;
                                setOpenClientId(next);
                                if (!isOpen) loadClientDetail(c.id);
                              }
                            }}
                            title={
                              c.total_orders > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td className={styles.mono}>{c.id}</td>
                            <td>
                              <div className={styles.cellPrimary}>{c.name}</div>
                              {c.total_orders > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{c.total_orders}</td>
                            <td className={styles.mono}>
                              {formatCurrency(c.total_cost)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(c.total_quote)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(c.total_profit)}
                            </td>
                          </tr>

                          {c.total_orders > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={6} className={styles.detailCell}>
                                {detail?.loading ? (
                                  <div className={styles.stateBox}>
                                    Caricamento dettagli…
                                  </div>
                                ) : detail?.error ? (
                                  <div className={styles.stateBoxError}>
                                    Errore: {detail.error}
                                  </div>
                                ) : (
                                  <table className={styles.detailTable}>
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Destinazione</th>
                                        <th>Colli</th>
                                        <th>Stato</th>
                                        <th>Costo</th>
                                        <th>Preventivo</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((o) => (
                                        <tr key={o.order_id}>
                                          <td className={styles.mono}>
                                            {o.order_id}
                                          </td>
                                          <td>{o.data_ordine}</td>
                                          <td className={styles.cellWrap}>
                                            {o.destinazione}
                                          </td>
                                          <td className={styles.mono}>
                                            {o.numero_colli}
                                          </td>
                                          <td>{o.stato}</td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.costo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.preventivo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.guadagno)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {Object.keys(clients).length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.stateBox}>
                          Nessun dato disponibile
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Mese</th>
                      <th>Ordini</th>
                      <th>Costo</th>
                      <th>Preventivo</th>
                      <th>Guadagno</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reportData.map((item, idx) => {
                      const isOpen = openMonth === item.month;
                      const detail = monthDetails[item.month];

                      return (
                        <React.Fragment key={`${item.month}-${idx}`}>
                          <tr
                            className={
                              item.total_orders > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (item.total_orders > 1) {
                                const next = isOpen ? null : item.month;
                                setOpenMonth(next);
                                if (!isOpen) loadMonthDetail(item.month);
                              }
                            }}
                            title={
                              item.total_orders > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td>
                              <div className={styles.cellPrimary}>
                                {item.month}
                              </div>
                              {item.total_orders > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{item.total_orders}</td>
                            <td className={styles.mono}>
                              {formatCurrency(item.total_cost)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(item.total_quote)}
                            </td>
                            <td className={styles.mono}>
                              {formatCurrency(item.total_profit)}
                            </td>
                          </tr>

                          {item.total_orders > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={5} className={styles.detailCell}>
                                {detail?.loading ? (
                                  <div className={styles.stateBox}>
                                    Caricamento dettagli…
                                  </div>
                                ) : detail?.error ? (
                                  <div className={styles.stateBoxError}>
                                    Errore: {detail.error}
                                  </div>
                                ) : (
                                  <table className={styles.detailTable}>
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Destinazione</th>
                                        <th>Colli</th>
                                        <th>Stato</th>
                                        <th>Costo</th>
                                        <th>Preventivo</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((o) => (
                                        <tr key={o.order_id}>
                                          <td className={styles.mono}>
                                            {o.order_id}
                                          </td>
                                          <td>{o.data_ordine}</td>
                                          <td className={styles.cellWrap}>
                                            {o.destinazione}
                                          </td>
                                          <td className={styles.mono}>
                                            {o.numero_colli}
                                          </td>
                                          <td>{o.stato}</td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.costo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.preventivo)}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(o.guadagno)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {reportData.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.stateBox}>
                          Nessun dato disponibile
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
