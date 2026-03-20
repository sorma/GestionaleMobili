"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import styles from "../../../../styles/reports.module.css";

export default function MontaggiReportsPage() {
  const [reportType, setReportType] = useState("montaggi_by_seller");
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
        const response = await fetch(`/api/montaggi/reports?type=${reportType}`, {
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || `Errore HTTP! status: ${response.status}`);
        }

        setReportData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Errore durante il recupero del report dei montaggi:", err);
        setReportData([]);
        setMessage(`Impossibile caricare il report dei montaggi: ${err.message}`);
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
            id: item.seller_id,
            name: `${item.seller_name} ${item.seller_lastname}`,
            total_montaggi: item.total_montaggi,
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
            id: item.client_id,
            name: `${item.client_name} ${item.client_lastname}`,
            total_montaggi: item.total_montaggi,
            total_profit: item.total_profit,
          };
        }
      }
      return acc;
    }, {});
  }, [reportData]);

  const totalMontaggi = useMemo(() => {
    if (reportType === "montaggi_by_seller") {
      return Object.values(sellers).reduce(
        (sum, s) => sum + s.total_montaggi,
        0
      );
    } else if (reportType === "montaggi_by_client") {
      return Object.values(clients).reduce(
        (sum, c) => sum + c.total_montaggi,
        0
      );
    } else {
      return reportData.reduce((sum, item) => sum + item.total_montaggi, 0);
    }
  }, [reportType, sellers, clients, reportData]);

  const totalProfit = useMemo(() => {
    if (reportType === "montaggi_by_seller") {
      return Object.values(sellers).reduce((sum, s) => sum + s.total_profit, 0);
    } else if (reportType === "montaggi_by_client") {
      return Object.values(clients).reduce((sum, c) => sum + c.total_profit, 0);
    } else {
      return reportData.reduce((sum, item) => sum + item.total_profit, 0);
    }
  }, [reportType, sellers, clients, reportData]);

  const entitiesCount = useMemo(() => {
    if (reportType === "montaggi_by_seller") {
      return Object.keys(sellers).length;
    } else if (reportType === "montaggi_by_client") {
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
        `/api/montaggi/reports?type=montaggi_detail_by_seller&seller_id=${sellerId}`,
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
        `/api/montaggi/reports?type=montaggi_detail_by_client&client_id=${clientId}`,
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
        `/api/montaggi/reports?type=montaggi_detail_by_month&month=${encodeURIComponent(
          month
        )}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setMonthDetails((prev) => ({
        ...prev,
        [month]: { loading: false, error: "", rows: Array.isArray(json) ? json : [] },
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
      case "montaggi_by_seller":
        return "Montaggi per venditore";
      case "montaggi_by_client":
        return "Montaggi per cliente";
      case "montaggi_over_time_monthly":
        return "Andamento mensile";
      default:
        return "Report montaggi";
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case "montaggi_by_seller":
        return "Analisi aggregata dei montaggi raggruppati per venditore con dettagli espandibili.";
      case "montaggi_by_client":
        return "Distribuzione dei montaggi per cliente con metriche di guadagno associate.";
      case "montaggi_over_time_monthly":
        return "Evoluzione temporale dei montaggi con aggregazione mensile e trend di guadagno.";
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
            <h1 className={styles.heading}>Report Montaggi</h1>
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
              <p className={styles.statLabel}>Totale montaggi</p>
              <h3 className={styles.statValue}>{totalMontaggi}</h3>
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
              {reportType === "montaggi_over_time_monthly" ? (
                <Calendar size={18} />
              ) : (
                <Users size={18} />
              )}
            </div>
            <div>
              <p className={styles.statLabel}>
                {reportType === "montaggi_by_seller"
                  ? "Venditori"
                  : reportType === "montaggi_by_client"
                  ? "Clienti"
                  : "Periodi"}
              </p>
              <h3 className={styles.statValue}>{entitiesCount}</h3>
              <p className={styles.statMeta}>
                {reportType === "montaggi_over_time_monthly"
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
                <option value="montaggi_by_seller">Per Venditore</option>
                <option value="montaggi_by_client">Per Cliente</option>
                <option value="montaggi_over_time_monthly">
                  Andamento Mensile
                </option>
              </select>
            </div>

            {reportType === "montaggi_by_seller" ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Venditore</th>
                      <th>Totale montaggi</th>
                      <th>Guadagno totale</th>
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
                              s.total_montaggi > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (s.total_montaggi > 1) {
                                const next = isOpen ? null : s.id;
                                setOpenSellerId(next);
                                if (!isOpen) loadSellerDetail(s.id);
                              }
                            }}
                            title={
                              s.total_montaggi > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td className={styles.mono}>{s.id}</td>
                            <td>
                              <div className={styles.cellPrimary}>{s.name}</div>
                              {s.total_montaggi > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{s.total_montaggi}</td>
                            <td className={styles.mono}>
                              {formatCurrency(s.total_profit)}
                            </td>
                          </tr>

                          {s.total_montaggi > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={4} className={styles.detailCell}>
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
                                        <th>Data inizio</th>
                                        <th>Tipologia</th>
                                        <th>Indirizzo</th>
                                        <th>Giorni</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((m) => (
                                        <tr key={m.montaggio_id}>
                                          <td className={styles.mono}>
                                            {m.montaggio_id}
                                          </td>
                                          <td>{m.data_inizio_stimata}</td>
                                          <td>{m.tipologia}</td>
                                          <td className={styles.cellWrap}>
                                            {m.indirizzo}
                                          </td>
                                          <td className={styles.mono}>
                                            {m.giorni_lavorativi_stimati}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(m.profit)}
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
                        <td colSpan={4} className={styles.stateBox}>
                          Nessun dato disponibile
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : reportType === "montaggi_by_client" ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colId}>ID</th>
                      <th>Cliente</th>
                      <th>Totale montaggi</th>
                      <th>Guadagno totale</th>
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
                              c.total_montaggi > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (c.total_montaggi > 1) {
                                const next = isOpen ? null : c.id;
                                setOpenClientId(next);
                                if (!isOpen) loadClientDetail(c.id);
                              }
                            }}
                            title={
                              c.total_montaggi > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td className={styles.mono}>{c.id}</td>
                            <td>
                              <div className={styles.cellPrimary}>{c.name}</div>
                              {c.total_montaggi > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{c.total_montaggi}</td>
                            <td className={styles.mono}>
                              {formatCurrency(c.total_profit)}
                            </td>
                          </tr>

                          {c.total_montaggi > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={4} className={styles.detailCell}>
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
                                        <th>Data inizio</th>
                                        <th>Tipologia</th>
                                        <th>Indirizzo</th>
                                        <th>Giorni</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((m) => (
                                        <tr key={m.montaggio_id}>
                                          <td className={styles.mono}>
                                            {m.montaggio_id}
                                          </td>
                                          <td>{m.data_inizio_stimata}</td>
                                          <td>{m.tipologia}</td>
                                          <td className={styles.cellWrap}>
                                            {m.indirizzo}
                                          </td>
                                          <td className={styles.mono}>
                                            {m.giorni_lavorativi_stimati}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(m.profit)}
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
                        <td colSpan={4} className={styles.stateBox}>
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
                      <th>Totale montaggi</th>
                      <th>Guadagno totale</th>
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
                              item.total_montaggi > 1 ? styles.expandableRow : ""
                            }
                            onClick={() => {
                              if (item.total_montaggi > 1) {
                                const next = isOpen ? null : item.month;
                                setOpenMonth(next);
                                if (!isOpen) loadMonthDetail(item.month);
                              }
                            }}
                            title={
                              item.total_montaggi > 1
                                ? "Clicca per espandere i dettagli"
                                : ""
                            }
                          >
                            <td>
                              <div className={styles.cellPrimary}>
                                {item.month}
                              </div>
                              {item.total_montaggi > 1 && (
                                <span
                                  className={`${styles.expandIcon} ${
                                    isOpen ? styles.expandIconOpen : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              )}
                            </td>
                            <td className={styles.mono}>{item.total_montaggi}</td>
                            <td className={styles.mono}>
                              {formatCurrency(item.total_profit)}
                            </td>
                          </tr>

                          {item.total_montaggi > 1 && isOpen && (
                            <tr className={styles.detailRow}>
                              <td colSpan={3} className={styles.detailCell}>
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
                                        <th>Data inizio</th>
                                        <th>Tipologia</th>
                                        <th>Indirizzo</th>
                                        <th>Giorni</th>
                                        <th>Guadagno</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detail?.rows ?? []).map((m) => (
                                        <tr key={m.montaggio_id}>
                                          <td className={styles.mono}>
                                            {m.montaggio_id}
                                          </td>
                                          <td>{m.data_inizio_stimata}</td>
                                          <td>{m.tipologia}</td>
                                          <td className={styles.cellWrap}>
                                            {m.indirizzo}
                                          </td>
                                          <td className={styles.mono}>
                                            {m.giorni_lavorativi_stimati}
                                          </td>
                                          <td className={styles.mono}>
                                            {formatCurrency(m.profit)}
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
                        <td colSpan={3} className={styles.stateBox}>
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
