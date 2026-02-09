'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../styles/form.module.css';

function CreateOrderForm() {
  const [venditori, setVenditori] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [venditoreId, setVenditoreId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [dataOrdine, setDataOrdine] = useState('');
  const [totale, setTotale] = useState('');
  const [numeroColli, setNumeroColli] = useState('');
  // Rimosso lo stato 'destinazione' dal form, non sarà più un input diretto
  const [message, setMessage] = useState('');

  // Stato per memorizzare l'indirizzo del cliente selezionato, che diventerà la destinazione
  const [destinazioneAutomatica, setDestinazioneAutomatica] = useState('');

  useEffect(() => {
    async function fetchData() {
      setMessage('');

      try {
        const [sellersResponse, clientsResponse] = await Promise.all([
          fetch('/api/sellers'),
          fetch('/api/clients')
        ]);

        if (!sellersResponse.ok) throw new Error(`Errore HTTP venditori! status: ${sellersResponse.status}`);
        if (!clientsResponse.ok) throw new Error(`Errore HTTP clienti! status: ${clientsResponse.status}`);

        const sellersData = await sellersResponse.json();
        const clientsData = await clientsResponse.json();

        setVenditori(sellersData);
        setClienti(clientsData);

      } catch (error) {
        console.error('Errore nel caricamento dati:', error);
        setMessage(`Errore nel caricamento dei dati: ${error.message}`);
      }
    }
    fetchData();
  }, []);

  // Questo useEffect si attiva ogni volta che 'clienteId' o 'clienti' cambiano
  // e aggiorna la 'destinazioneAutomatica'
  useEffect(() => {
    if (clienteId) {
      const client = clienti.find(c => c.id === parseInt(clienteId, 10));
      if (client && client.indirizzo) { // Assicurati che l'indirizzo esista
        setDestinazioneAutomatica(client.indirizzo);
      } else {
        setDestinazioneAutomatica('Indirizzo non disponibile per questo cliente');
      }
    } else {
      setDestinazioneAutomatica(''); // Resetta se nessun cliente è selezionato
    }
  }, [clienteId, clienti]); // Dipendenze: clienteId e la lista completa dei clienti

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    // Aggiungiamo una validazione per la destinazione automatica
    if (!destinazioneAutomatica || destinazioneAutomatica === 'Indirizzo non disponibile per questo cliente') {
      setMessage('Errore: Seleziona un cliente valido con un indirizzo per la destinazione.');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venditore_id: parseInt(venditoreId, 10),
          cliente_id: parseInt(clienteId, 10),
          data_ordine: dataOrdine,
          totale: parseFloat(totale),
          numero_colli: parseInt(numeroColli, 10),
          destinazione: destinazioneAutomatica, // Invia la destinazione generata automaticamente
        }),
      });

      if (response.ok) {
        setMessage('Ordine creato con successo!');
        // Resetta tutti i campi del form
        setVenditoreId('');
        setClienteId('');
        setDataOrdine('');
        setTotale('');
        setNumeroColli('');
        setDestinazioneAutomatica(''); // Resetta anche la destinazione automatica
      } else {
        const errorData = await response.json();
        setMessage(
          `Errore nella creazione dell'ordine: ${errorData.error || "Impossibile creare l'ordine."}`
        );
      }
    } catch (error) {
      setMessage(`Errore di rete: ${error.message}`);
    }
  };

 return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Crea Nuovo Ordine</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      {message && (
        <div className={message.startsWith('Errore') ? styles.errorMessage : styles.successMessage}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Informazioni Base</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="venditoreId">Venditore</label>
              <select id="venditoreId" value={venditoreId} onChange={(e) => setVenditoreId(e.target.value)} required>
                <option value="">Seleziona un venditore</option>
                {venditori.map((venditore) => (
                  <option key={venditore.id} value={venditore.id}>
                    {venditore.nome} {venditore.cognome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="clienteId">Cliente</label>
              <select id="clienteId" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                <option value="">Seleziona un cliente</option>
                {clienti.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.cognome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dettagli Ordine</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="dataOrdine">Data Ordine</label>
              <input
                type="date"
                id="dataOrdine"
                value={dataOrdine}
                onChange={(e) => setDataOrdine(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="totale">Totale (€)</label>
              <div className={styles.currencyInput}>
                <span>€</span>
                <input
                  type="number"
                  id="totale"
                  value={totale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setTotale(val < 0 ? '0' : e.target.value);
                  }}
                  required
                  min="0"
                  step="50"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="numeroColli">Numero Colli</label>
              <input
                type="number"
                id="numeroColli"
                value={numeroColli}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setNumeroColli(val < 0 ? '0' : e.target.value);
                }}
                required
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Spedizione</h2>
          <div className={styles.formGroup}>
            <label htmlFor="destinazioneAutomatica">Indirizzo di Spedizione</label>
            <div className={styles.readOnlyField}>
              {destinazioneAutomatica || "Seleziona un cliente per visualizzare l'indirizzo"}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton}>
            Crea Ordine
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => {
            setVenditoreId('');
            setClienteId('');
            setDataOrdine('');
            setTotale('');
            setNumeroColli('');
          }}>
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrderForm;
