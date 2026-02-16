"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../styles/client-seller-magazine-report-list.module.css";

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
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

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
        [sellerId]: { loading: false, error: "", rows: Array.isArray(json) ? json : [] },
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
        [clientId]: { loading: false, error: "", rows: Array.isArray(json) ? json : [] },
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
        `/api/montaggi/reports?type=montaggi_detail_by_month&month=${encodeURIComponent(month)}`,
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

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Report Montaggi</h1>
            <p className={styles.subheading}>Seleziona un report e consulta i risultati.</p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.counter}>
            {reportType === "montaggi_by_seller"
              ? "Totale montaggi per venditore"
              : reportType === "montaggi_by_client"
              ? "Totale montaggi per cliente"
              : "Andamento montaggi mensili"}
          </div>

          <div className={styles.toolbarActions}>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#fff",
                fontWeight: 700,
                color: "#0f172a",
              }}
              aria-label="Seleziona report montaggi"
            >
              <option value="montaggi_by_seller">Totale Montaggi per Venditore</option>
              <option value="montaggi_by_client">Totale Montaggi per Cliente</option>
              <option value="montaggi_over_time_monthly">Andamento Montaggi Mensili</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>Caricamento report…</div>
        ) : message ? (
          <div className={styles.stateBoxError}>{message}</div>
        ) : reportType === "montaggi_by_seller" ? (
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
                        style={{ cursor: s.total_montaggi > 1 ? "pointer" : "default" }}
                        onClick={() => {
                          if (s.total_montaggi > 1) {
                            const next = isOpen ? null : s.id;
                            setOpenSellerId(next);
                            if (!isOpen) loadSellerDetail(s.id);
                          }
                        }}
                        title={s.total_montaggi > 1 ? "Clicca per vedere i dettagli montaggi" : ""}
                      >
                        <td className={styles.mono}>{s.id}</td>
                        <td>
                          {s.name}{" "}
                          {s.total_montaggi > 1 ? (
                            <span style={{ opacity: 0.7, fontWeight: 700 }}>
                              {isOpen ? "▾" : "▸"}
                            </span>
                          ) : null}
                        </td>
                        <td className={styles.mono}>{s.total_montaggi}</td>
                        <td className={styles.mono}>{formatCurrency(s.total_profit)}</td>
                      </tr>

                      {s.total_montaggi > 1 && isOpen && (
                        <tr>
                          <td colSpan={4} style={{ padding: "0.75rem", backgroundColor: "var(--color-surface, #fafafa)" }}>
                            {detail?.loading ? (
                              <div className={styles.stateBox}>Caricamento dettagli…</div>
                            ) : detail?.error ? (
                              <div className={styles.stateBoxError}>
                                Impossibile caricare i dettagli: {detail.error}
                              </div>
                            ) : (
                              <table className={styles.table} style={{ marginTop: 8 }}>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Data inizio stimata</th>
                                    <th>Tipologia</th>
                                    <th>Indirizzo</th>
                                    <th>Giorni stimati</th>
                                    <th>Guadagno</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(detail?.rows ?? []).map((m) => (
                                    <tr key={m.montaggio_id}>
                                      <td className={styles.mono}>{m.montaggio_id}</td>
                                      <td>{m.data_inizio_stimata}</td>
                                      <td>{m.tipologia}</td>
                                      <td>{m.indirizzo}</td>
                                      <td className={styles.mono}>{m.giorni_lavorativi_stimati}</td>
                                      <td className={styles.mono}>{formatCurrency(m.profit)}</td>
                                    </tr>
                                  ))}

                                  {(detail?.rows ?? []).length === 0 && (
                                    <tr>
                                      <td colSpan={6} className={styles.stateBox}>
                                        Nessun montaggio di dettaglio trovato.
                                      </td>
                                    </tr>
                                  )}
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
                      Nessun dato disponibile per i venditori.
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
                        style={{ cursor: c.total_montaggi > 1 ? "pointer" : "default" }}
                        onClick={() => {
                          if (c.total_montaggi > 1) {
                            const next = isOpen ? null : c.id;
                            setOpenClientId(next);
                            if (!isOpen) loadClientDetail(c.id);
                          }
                        }}
                        title={c.total_montaggi > 1 ? "Clicca per vedere i dettagli montaggi" : ""}
                      >
                        <td className={styles.mono}>{c.id}</td>
                        <td>
                          {c.name}{" "}
                          {c.total_montaggi > 1 ? (
                            <span style={{ opacity: 0.7, fontWeight: 700 }}>
                              {isOpen ? "▾" : "▸"}
                            </span>
                          ) : null}
                        </td>
                        <td className={styles.mono}>{c.total_montaggi}</td>
                        <td className={styles.mono}>{formatCurrency(c.total_profit)}</td>
                      </tr>

                      {c.total_montaggi > 1 && isOpen && (
                        <tr>
                          <td colSpan={4} style={{ padding: "0.75rem", backgroundColor: "var(--color-surface, #fafafa)" }}>
                            {detail?.loading ? (
                              <div className={styles.stateBox}>Caricamento dettagli…</div>
                            ) : detail?.error ? (
                              <div className={styles.stateBoxError}>
                                Impossibile caricare i dettagli: {detail.error}
                              </div>
                            ) : (
                              <table className={styles.table} style={{ marginTop: 8 }}>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Data inizio stimata</th>
                                    <th>Tipologia</th>
                                    <th>Indirizzo</th>
                                    <th>Giorni stimati</th>
                                    <th>Guadagno</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(detail?.rows ?? []).map((m) => (
                                    <tr key={m.montaggio_id}>
                                      <td className={styles.mono}>{m.montaggio_id}</td>
                                      <td>{m.data_inizio_stimata}</td>
                                      <td>{m.tipologia}</td>
                                      <td>{m.indirizzo}</td>
                                      <td className={styles.mono}>{m.giorni_lavorativi_stimati}</td>
                                      <td className={styles.mono}>{formatCurrency(m.profit)}</td>
                                    </tr>
                                  ))}

                                  {(detail?.rows ?? []).length === 0 && (
                                    <tr>
                                      <td colSpan={6} className={styles.stateBox}>
                                        Nessun montaggio di dettaglio trovato.
                                      </td>
                                    </tr>
                                  )}
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
                      Nessun dato disponibile per i clienti.
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
                        style={{ cursor: item.total_montaggi > 1 ? "pointer" : "default" }}
                        onClick={() => {
                          if (item.total_montaggi > 1) {
                            const next = isOpen ? null : item.month;
                            setOpenMonth(next);
                            if (!isOpen) loadMonthDetail(item.month);
                          }
                        }}
                        title={item.total_montaggi > 1 ? "Clicca per vedere i dettagli montaggi" : ""}
                      >
                        <td>
                          {item.month}{" "}
                          {item.total_montaggi > 1 ? (
                            <span style={{ opacity: 0.7, fontWeight: 700 }}>
                              {isOpen ? "▾" : "▸"}
                            </span>
                          ) : null}
                        </td>
                        <td className={styles.mono}>{item.total_montaggi}</td>
                        <td className={styles.mono}>{formatCurrency(item.total_profit)}</td>
                      </tr>

                      {item.total_montaggi > 1 && isOpen && (
                        <tr>
                          <td colSpan={3} style={{ padding: "0.75rem", backgroundColor: "var(--color-surface, #fafafa)" }}>
                            {detail?.loading ? (
                              <div className={styles.stateBox}>Caricamento dettagli…</div>
                            ) : detail?.error ? (
                              <div className={styles.stateBoxError}>
                                Impossibile caricare i dettagli: {detail.error}
                              </div>
                            ) : (
                              <table className={styles.table} style={{ marginTop: 8 }}>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Data inizio stimata</th>
                                    <th>Tipologia</th>
                                    <th>Indirizzo</th>
                                    <th>Giorni stimati</th>
                                    <th>Guadagno</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(detail?.rows ?? []).map((m) => (
                                    <tr key={m.montaggio_id}>
                                      <td className={styles.mono}>{m.montaggio_id}</td>
                                      <td>{m.data_inizio_stimata}</td>
                                      <td>{m.tipologia}</td>
                                      <td>{m.indirizzo}</td>
                                      <td className={styles.mono}>{m.giorni_lavorativi_stimati}</td>
                                      <td className={styles.mono}>{formatCurrency(m.profit)}</td>
                                    </tr>
                                  ))}

                                  {(detail?.rows ?? []).length === 0 && (
                                    <tr>
                                      <td colSpan={6} className={styles.stateBox}>
                                        Nessun montaggio di dettaglio trovato.
                                      </td>
                                    </tr>
                                  )}
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
                      Nessun dato disponibile per l’andamento mensile dei montaggi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
