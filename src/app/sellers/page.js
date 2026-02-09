'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import styles from '../../styles/order-list.module.css';

function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSellers() {
      try {
        const response = await fetch('/api/sellers');
        if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
        const data = await response.json();
        setSellers(data);
      } catch (err) {
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSellers();
  }, []);

  const handleDeleteSeller = async (id) => {
    try {
      const response = await fetch(`/api/sellers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione venditore');
      setSellers(sellers.filter(seller => seller.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Elenco Venditori</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Caricamento venditori...</p>
        </div>
      ) : message ? (
        <div className={styles.errorContainer}>
          <p>{message}</p>
        </div>
      ) : sellers.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Telefono</th>
                <th>Nazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id}>
                  <td>{seller.id}</td>
                  <td>{seller.nome}</td>
                  <td>{seller.cognome}</td>
                  <td>{seller.telefono}</td>
                  <td>{seller.nazione}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteSeller(seller.id)}
                      className={styles.deleteButton}
                      aria-label={`Elimina venditore ${seller.id}`}
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
          <p>Nessun venditore presente</p>
        </div>
      )}
    </div>
  );
}

export default SellerList;