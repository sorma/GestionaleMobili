'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../styles/reports.module.css'; // Usiamo gli stessi stili

function MontaggiReportsPage() {
  const [reportType, setReportType] = useState('montaggi_by_seller'); // Tipo di report predefinito
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);
      setMessage('');
      try {
        // Chiamiamo il nuovo endpoint API dedicato ai report dei montaggi
        const response = await fetch(`/api/montaggi/reports?type=${reportType}`);
        if (!response.ok) {
          throw new Error(`Errore HTTP! status: ${response.status}`);
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Errore durante il recupero del report dei montaggi:', err);
        setMessage(`Impossibile caricare il report dei montaggi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, [reportType]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Raggruppa i dati per venditore (dal report 'montaggi_by_seller')
  const sellers = reportData.reduce((acc, item) => {
    // Controlla se l'item ha le proprietà attese per un venditore
    if (item.seller_id && item.seller_name && item.seller_lastname) {
      const sellerKey = item.seller_id;
      if (!acc[sellerKey]) {
        acc[sellerKey] = {
          name: `${item.seller_name} ${item.seller_lastname}`,
          id: item.seller_id,
          // Gli "orders" qui sono in realtà "montaggi" aggregati
          items: [] 
        };
      }
      acc[sellerKey].items.push(item);
    }
    return acc;
  }, {});

  // Raggruppa i dati per cliente (dal report 'montaggi_by_client')
  const clients = reportData.reduce((acc, item) => {
    // Controlla se l'item ha le proprietà attese per un cliente
    if (item.client_id && item.client_name && item.client_lastname) {
      const clientKey = item.client_id;
      if (!acc[clientKey]) {
        acc[clientKey] = {
          name: `${item.client_name} ${item.client_lastname}`,
          id: item.client_id,
          // Gli "orders" qui sono in realtà "montaggi" aggregati
          items: []
        };
      }
      acc[clientKey].items.push(item);
    }
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Report e Analisi Montaggi</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label htmlFor="report-select">Seleziona Report:</label>
          <select
            id="report-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={styles.select}
          >
            <option value="montaggi_by_seller">Totale Montaggi per Venditore</option>
            <option value="montaggi_by_client">Totale Montaggi per Cliente</option>
            <option value="montaggi_over_time_monthly">Andamento Montaggi Mensili</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Caricamento report...</p>
        </div>
      ) : message ? (
        <div className={styles.error}>
          <p>{message}</p>
        </div>
      ) : (
        <div className={styles.reportContent}>
          {reportType === 'montaggi_by_seller' && (
            <>
              <h2 className={styles.reportTitle}>Report Montaggi per Venditore</h2>
              {Object.keys(sellers).length > 0 ? (
                <div className={styles.reportGrid}>
                  {Object.values(sellers).map((seller) => (
                    <div key={seller.id} className={styles.reportCard}>
                      <h3 className={styles.cardTitle}>
                        {seller.name} <span className={styles.idBadge}>ID: {seller.id}</span>
                      </h3>
                      <div className={styles.cardContent}>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Totale Montaggi</span>
                          <span className={styles.metricValue}>{seller.items[0].total_montaggi}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Valore Totale</span>
                          <span className={styles.metricValue}>
                            {formatCurrency(seller.items[0].total_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <p>Nessun dato disponibile per i venditori</p>
                </div>
              )}
            </>
          )}

          {reportType === 'montaggi_by_client' && (
            <>
              <h2 className={styles.reportTitle}>Report Montaggi per Cliente</h2>
              {Object.keys(clients).length > 0 ? (
                <div className={styles.reportGrid}>
                  {Object.values(clients).map((client) => (
                    <div key={client.id} className={styles.reportCard}>
                      <h3 className={styles.cardTitle}>
                        {client.name} <span className={styles.idBadge}>ID: {client.id}</span>
                      </h3>
                      <div className={styles.cardContent}>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Totale Montaggi</span>
                          <span className={styles.metricValue}>{client.items[0].total_montaggi}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Valore Totale</span>
                          <span className={styles.metricValue}>
                            {formatCurrency(client.items[0].total_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <p>Nessun dato disponibile per i clienti</p>
                </div>
              )}
            </>
          )}

          {reportType === 'montaggi_over_time_monthly' && (
            <>
              <h2 className={styles.reportTitle}>Andamento Montaggi Mensili</h2>
              {reportData.length > 0 ? (
                <div className={styles.reportGrid}>
                  {reportData.map((item, index) => (
                    <div key={index} className={styles.reportCard}>
                      <h3 className={styles.cardTitle}>{item.month}</h3>
                      <div className={styles.cardContent}>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Totale Montaggi</span>
                          <span className={styles.metricValue}>{item.total_montaggi}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Valore Totale</span>
                          <span className={styles.metricValue}>
                            {formatCurrency(item.total_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <p>Nessun dato disponibile per l andamento mensile dei montaggi</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MontaggiReportsPage;
