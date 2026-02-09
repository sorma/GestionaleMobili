'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import styles from '../../styles/order-list.module.css';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortDate, setSortDate] = useState('none');
  const [sortPrice, setSortPrice] = useState('none');
  const [sortColli, setSortColli] = useState('none');
  const [filterStatus, setFilterStatus] = useState('tutti'); // Ora corrisponde ai valori reali del DB
  const [filterSeller, setFilterSeller] = useState('tutti');
  const [filterClient, setFilterClient] = useState('tutti'); // Nuovo filtro per il cliente

  // Funzione per recuperare gli ordini dal backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
      const data = await response.json();
      setOrders(data); // I dati sono già normalizzati dal backend
    } catch (err) {
      console.error('Errore caricamento ordini:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Esegui la fetch solo una volta al montaggio

  const toggleDeliveryStatus = async (id, currentStatus) => {
    // Determina il nuovo stato
    const newStatus = currentStatus.toLowerCase() === 'consegnato' ? 'In Lavorazione' : 'Consegnato';

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento dello stato: ${response.status}`);
      }

      // Se l'API ha successo, aggiorna lo stato localmente
      setOrders(prev =>
        prev.map(order =>
          order.id === id
            ? { ...order, stato: newStatus } // Aggiorna la colonna 'stato'
            : order
        )
      );
    } catch (err) {
      console.error('Errore nel cambio stato:', err);
      alert(`Errore nel cambio stato: ${err.message}`); // Puoi usare un toast/messaggio più sofisticato qui
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione ordine');
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      console.error('Errore eliminazione ordine:', err);
      alert(`Errore nell'eliminazione dell'ordine: ${err.message}`);
    }
  };

  const nextSortState = (current) => {
    switch (current) {
      case 'none': return 'asc';
      case 'asc': return 'desc';
      case 'desc': return 'none';
      default: return 'none';
    }
  };

  const handleDateClick = () => {
    setSortDate(prev => nextSortState(prev));
    setSortPrice('none');
    setSortColli('none');
  };

  const handlePriceClick = () => {
    setSortPrice(prev => nextSortState(prev));
    setSortDate('none');
    setSortColli('none');
  };

  const handleColliClick = () => {
    setSortColli(prev => nextSortState(prev));
    setSortDate('none');
    setSortPrice('none');
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtro per stato (usa la colonna 'stato' diretta dal DB)
    if (filterStatus !== 'tutti') {
      filtered = filtered.filter(o => o.stato.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filtro per venditore
    if (filterSeller !== 'tutti') {
      filtered = filtered.filter(o => {
        const sellerName = `${o.venditore_nome} ${o.venditore_cognome}`;
        return sellerName === filterSeller;
      });
    }

    // Filtro per cliente (nuovo)
    if (filterClient !== 'tutti') {
      filtered = filtered.filter(o => {
        const clientName = `${o.cliente_nome} ${o.cliente_cognome}`;
        return clientName === filterClient;
      });
    }

    // Ordinamento
    if (sortDate !== 'none') {
      filtered.sort((a, b) => {
        const aDate = new Date(a.data_ordine);
        const bDate = new Date(b.data_ordine);
        if (aDate < bDate) return sortDate === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDate === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (sortPrice !== 'none') {
      filtered.sort((a, b) => {
        const aPrice = parseFloat(a.totale);
        const bPrice = parseFloat(b.totale);
        if (aPrice < bPrice) return sortPrice === 'asc' ? -1 : 1;
        if (aPrice > bPrice) return sortPrice === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (sortColli !== 'none') {
      filtered.sort((a, b) => {
        const aColli = parseInt(a.numero_colli, 10);
        const bColli = parseInt(b.numero_colli, 10);
        if (aColli < bColli) return sortColli === 'asc' ? -1 : 1;
        if (aColli > bColli) return sortColli === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [orders, filterStatus, filterSeller, filterClient, sortDate, sortPrice, sortColli]);

  // Lista dei venditori e clienti unici per i filtri
  const sellersList = useMemo(() => {
    const sellersSet = new Set();
    orders.forEach(o => {
      sellersSet.add(`${o.venditore_nome} ${o.venditore_cognome}`);
    });
    return Array.from(sellersSet).sort();
  }, [orders]);

  const clientsList = useMemo(() => {
    const clientsSet = new Set();
    orders.forEach(o => {
      clientsSet.add(`${o.cliente_nome} ${o.cliente_cognome}`);
    });
    return Array.from(clientsSet).sort();
  }, [orders]);

  const getSortButtonClass = (state) => {
    switch(state) {
      case 'asc': return `${styles.sortButton} ${styles.sortAsc}`;
      case 'desc': return `${styles.sortButton} ${styles.sortDesc}`;
      case 'none':
      default: return `${styles.sortButton} ${styles.sortNone}`;
    }
  };

  if (loading) {
    return <p className={styles.loading}>Caricamento ordini...</p>;
  }

  if (error) {
    return <p className={styles.error}>Errore nel caricamento degli ordini: {error}</p>;
  }

    return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Elenco Ordini</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <p>Caricamento ordini...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p>Errore nel caricamento degli ordini: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className={styles.filtersContainer}>
            <div className={styles.sortButtons}>
              <button
                type="button"
                onClick={handleDateClick}
                className={getSortButtonClass(sortDate)}
                aria-pressed={sortDate !== 'none'}
              >
                Data {sortDate === 'asc' ? '↑' : sortDate === 'desc' ? '↓' : '-'}
              </button>

              <button
                type="button"
                onClick={handlePriceClick}
                className={getSortButtonClass(sortPrice)}
                aria-pressed={sortPrice !== 'none'}
              >
                Prezzo {sortPrice === 'asc' ? '↑' : sortPrice === 'desc' ? '↓' : '-'}
              </button>

              <button
                type="button"
                onClick={handleColliClick}
                className={getSortButtonClass(sortColli)}
                aria-pressed={sortColli !== 'none'}
              >
                Colli {sortColli === 'asc' ? '↑' : sortColli === 'desc' ? '↓' : '-'}
              </button>
            </div>

            <div className={styles.filterSelects}>
              <div className={styles.filterGroup}>
                <label htmlFor="filterStatus">Stato:</label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="tutti">Tutti</option>
                  <option value="in lavorazione">In Lavorazione</option>
                  <option value="consegnato">Consegnato</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterSeller">Venditore:</label>
                <select
                  id="filterSeller"
                  value={filterSeller}
                  onChange={e => setFilterSeller(e.target.value)}
                >
                  <option value="tutti">Tutti</option>
                  {sellersList.map(seller => (
                    <option key={seller} value={seller}>{seller}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterClient">Cliente:</label>
                <select
                  id="filterClient"
                  value={filterClient}
                  onChange={e => setFilterClient(e.target.value)}
                >
                  <option value="tutti">Tutti</option>
                  {clientsList.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredAndSortedOrders.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Venditore</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Totale (€)</th>
                    <th>Colli</th>
                    <th>Destinazione</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.venditore_nome} {order.venditore_cognome}</td>
                      <td>{order.cliente_nome} {order.cliente_cognome}</td>
                      <td>{order.data_ordine}</td>
                      <td>{order.totale}</td>
                      <td>{order.numero_colli}</td>
                      <td>{order.destinazione}</td>
                      <td>
                        <button 
                          onClick={() => toggleDeliveryStatus(order.id, order.stato)}
                          className={styles.statusButton}
                          data-status={order.stato.toLowerCase()}
                        >
                          {order.stato}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className={styles.deleteButton}
                          aria-label={`Elimina ordine ${order.id}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>Nessun ordine trovato con i filtri selezionati</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderList;