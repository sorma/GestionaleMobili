// src/app/montaggi/page.js
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react'; // Icona per eliminare
import styles from '../../styles/order-list.module.css'; // Nuovo file CSS

function MontaggiList() {
  const [montaggi, setMontaggi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per l'ordinamento e il filtro
  const [sortDataInizio, setSortDataInizio] = useState('none');
  const [sortImporto, setSortImporto] = useState('none');
  const [sortGiorniStimati, setSortGiorniStimati] = useState('none');
  const [filterTipologia, setFilterTipologia] = useState('tutti');

  // Funzione per recuperare i montaggi dal backend
  const fetchMontaggi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/montaggi');
      if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
      const data = await response.json();
      setMontaggi(data);
    } catch (err) {
      console.error('Errore caricamento montaggi:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMontaggi();
  }, []); // Esegui la fetch solo una volta al montaggio

  const handleDeleteMontaggio = async (id) => {
    try {
      const response = await fetch(`/api/montaggi/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione montaggio');
      setMontaggi(prev => prev.filter(montaggio => montaggio.id !== id));
    } catch (err) {
      console.error('Errore eliminazione montaggio:', err);
      // Potresti voler aggiungere qui una gestione dell'errore visibile all'utente,
      // ma senza un alert bloccante, ad esempio un messaggio temporaneo a schermo.
      // Per ora, manterremo solo il console.error.
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

  const handleDataInizioClick = () => {
    setSortDataInizio(prev => nextSortState(prev));
    setSortImporto('none');
    setSortGiorniStimati('none');
  };

  const handleImportoClick = () => {
    setSortImporto(prev => nextSortState(prev));
    setSortDataInizio('none');
    setSortGiorniStimati('none');
  };

  const handleGiorniStimatiClick = () => {
    setSortGiorniStimati(prev => nextSortState(prev));
    setSortDataInizio('none');
    setSortImporto('none');
  };

  const filteredAndSortedMontaggi = useMemo(() => {
    let filtered = [...montaggi];

    // Filtro per tipologia
    if (filterTipologia !== 'tutti') {
      filtered = filtered.filter(m => m.tipologia.toLowerCase() === filterTipologia.toLowerCase());
    }

    // Ordinamento
    if (sortDataInizio !== 'none') {
      filtered.sort((a, b) => {
        const aDate = a.data_inizio_stimata ? new Date(a.data_inizio_stimata) : new Date(0); // Gestisce null
        const bDate = b.data_inizio_stimata ? new Date(b.data_inizio_stimata) : new Date(0); // Gestisce null
        if (aDate < bDate) return sortDataInizio === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDataInizio === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (sortImporto !== 'none') {
      filtered.sort((a, b) => {
        const aImporto = parseFloat(a.importo);
        const bImporto = parseFloat(b.importo);
        if (aImporto < bImporto) return sortImporto === 'asc' ? -1 : 1;
        if (aImporto > bImporto) return sortImporto === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (sortGiorniStimati !== 'none') {
      filtered.sort((a, b) => {
        const aGiorni = parseInt(a.giorni_lavorativi_stimati, 10);
        const bGiorni = parseInt(b.giorni_lavorativi_stimati, 10);
        if (aGiorni < bGiorni) return sortGiorniStimati === 'asc' ? -1 : 1;
        if (aGiorni > bGiorni) return sortGiorniStimati === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [montaggi, filterTipologia, sortDataInizio, sortImporto, sortGiorniStimati]);

  const tipologieList = useMemo(() => {
    const tipologieSet = new Set();
    montaggi.forEach(m => {
      if (m.tipologia) tipologieSet.add(m.tipologia);
    });
    return Array.from(tipologieSet).sort();
  }, [montaggi]);

  const getSortButtonClass = (state) => {
    switch(state) {
      case 'asc': return `${styles.sortButton} ${styles.sortAsc}`;
      case 'desc': return `${styles.sortButton} ${styles.sortDesc}`;
      case 'none':
      default: return `${styles.sortButton} ${styles.sortNone}`;
    }
  };

  if (loading) {
    return <p className={styles.loading}>Caricamento montaggi...</p>;
  }

  if (error) {
    return <p className={styles.error}>Errore nel caricamento dei montaggi: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Elenco Montaggi</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.sortButtons}>
          <button
            type="button"
            onClick={handleDataInizioClick}
            className={getSortButtonClass(sortDataInizio)}
            aria-pressed={sortDataInizio !== 'none'}
          >
            Data Inizio {sortDataInizio === 'asc' ? '↑' : sortDataInizio === 'desc' ? '↓' : '-'}
          </button>

          <button
            type="button"
            onClick={handleImportoClick}
            className={getSortButtonClass(sortImporto)}
            aria-pressed={sortImporto !== 'none'}
          >
            Importo {sortImporto === 'asc' ? '↑' : sortImporto === 'desc' ? '↓' : '-'}
          </button>

          <button
            type="button"
            onClick={handleGiorniStimatiClick}
            className={getSortButtonClass(sortGiorniStimati)}
            aria-pressed={sortGiorniStimati !== 'none'}
          >
            Giorni Stimati {sortGiorniStimati === 'asc' ? '↑' : sortGiorniStimati === 'desc' ? '↓' : '-'}
          </button>
        </div>

        <div className={styles.filterSelects}>
          <div className={styles.filterGroup}>
            <label htmlFor="filterTipologia">Tipologia:</label>
            <select
              id="filterTipologia"
              value={filterTipologia}
              onChange={e => setFilterTipologia(e.target.value)}
            >
              <option value="tutti">Tutti</option>
              {tipologieList.map(tipologia => (
                <option key={tipologia} value={tipologia}>{tipologia}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedMontaggi.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Venditore</th> {/* Nuova Colonna */}
                <th>Cliente</th>    {/* Nuova Colonna */}
                <th>Indirizzo</th>
                <th>Tipologia</th>
                <th>Importo (€)</th>
                <th>Giorni Stimati</th>
                <th>Data Inizio Stimata</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMontaggi.map(montaggio => (
                <tr key={montaggio.id}>
                  <td>{montaggio.id}</td>
                  {/* Visualizzazione Venditore */}
                  <td>
                    {montaggio.venditore ? 
                     `${montaggio.venditore.nome || ''} ${montaggio.venditore.cognome || ''}`.trim() : 
                     'N/D'}
                  </td>
                  {/* Visualizzazione Cliente */}
                  <td>
                    {montaggio.cliente ? 
                     `${montaggio.cliente.nome || ''} ${montaggio.cliente.cognome || ''}`.trim() : 
                     'N/D'}
                  </td>
                  <td>{montaggio.indirizzo}</td>
                  <td>{montaggio.tipologia}</td>
                  <td>{montaggio.importo.toFixed(2)}</td>
                  <td>{montaggio.giorni_lavorativi_stimati}</td>
                  <td>{montaggio.data_inizio_stimata ? new Date(montaggio.data_inizio_stimata).toLocaleDateString('it-IT') : 'N/D'}</td> {/* Formattazione data */}
                  <td>
                    <button
                      onClick={() => handleDeleteMontaggio(montaggio.id)}
                      className={styles.deleteButton}
                      aria-label={`Elimina montaggio ${montaggio.id}`}
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
          <p>Nessun montaggio trovato con i filtri selezionati</p>
        </div>
      )}
    </div>
  );
}

export default MontaggiList;