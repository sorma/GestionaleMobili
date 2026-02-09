'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import styles from '../../styles/order-list.module.css';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const handleDeleteClient = async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione cliente');
      setClients(clients.filter(client => client.id !== id));
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Elenco Clienti</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Caricamento clienti...</p>
        </div>
      ) : message ? (
        <div className={styles.errorContainer}>
          <p>{message}</p>
        </div>
      ) : clients.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Telefono</th>
                <th>Indirizzo</th>
                <th>Nazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.nome}</td>
                  <td>{client.cognome}</td>
                  <td>{client.telefono}</td>
                  <td>{client.indirizzo}</td>
                  <td>{client.nazione}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className={styles.deleteButton}
                      aria-label={`Elimina cliente ${client.id}`}
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
          <p>Nessun cliente presente</p>
        </div>
      )}
    </div>
  );
}

export default ClientList;