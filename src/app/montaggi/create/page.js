'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../styles/form.module.css';

function CreateMontaggioForm() {
  const [indirizzo, setIndirizzo] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [importo, setImporto] = useState('');
  const [giorniLavorativiStimati, setGiorniLavorativiStimati] = useState('');
  const [dataInizioStimata, setDataInizioStimata] = useState('');
  const [message, setMessage] = useState('');

  const [venditori, setVenditori] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [venditoreSelezionato, setVenditoreSelezionato] = useState(''); // ID del venditore (sarà una stringa dal select)
  const [clienteSelezionato, setClienteSelezionato] = useState('');     // ID del cliente (sarà una stringa dal select)

  const [indirizzoShouldBePrepopulated, setIndirizzoShouldBePrepopulated] = useState(false);
  const [isClienteSelectDisabled, setIsClienteSelectDisabled] = useState(true);

  // Qui useremo i NOMI e COGNOMI, ma ci assicureremo che il confronto avvenga con la struttura dati corretta.
  // Se i tuoi venditori sono 'Gaetano Sormani' e 'Francesco Sormani'
  // significa che l'oggetto venditore dalla tua API ha { nome: 'Gaetano', cognome: 'Sormani' }
  // Se invece fosse { nomeCompleto: 'Gaetano Sormani' }, la logica sarebbe diversa.
  // Assumiamo nome e cognome separati come da discussione precedente.

  const fetchVenditori = async () => {
    try {
      const response = await fetch('/api/sellers');
      if (response.ok) {
        const data = await response.json();
        setVenditori(data);
      } else {
        console.error("Errore nel caricamento dei venditori:", await response.json());
        setMessage('Errore nel caricamento dei venditori.');
      }
    } catch (error) {
      console.error("Errore di rete nel caricamento venditori:", error);
      setMessage('Errore di rete nel caricamento dei venditori.');
    }
  };

  const fetchClienti = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClienti(data);
      } else {
        console.error("Errore nel caricamento dei clienti:", await response.json());
        setMessage('Errore nel caricamento dei clienti.');
      }
    } catch (error) {
      console.error("Errore di rete nel caricamento clienti:", error);
      setMessage('Errore nel caricamento dei clienti.');
    }
  };

  useEffect(() => {
    fetchVenditori();
    fetchClienti();
  }, []);

  // Effetto per gestire la logica di precompilazione indirizzo e abilitazione/disabilitazione cliente
  useEffect(() => {
    // Troviamo il venditore selezionato nel nostro stato 'venditori'
    // Convertiamo venditoreSelezionato a numero per il confronto, dato che gli ID sono interi
    const currentSelectedVenditoreId = parseInt(venditoreSelezionato, 10);
    const selectedVenditore = venditori.find(v => (v._id || v.id) === currentSelectedVenditoreId);
    
    // VERIFICA CORRETTA DEL NOME E COGNOME DEL VENDITORE BASANDOSI SULLA STRUTTURA API
    // Assicurati che 'nome' sia 'Gaetano'/'Francesco' e 'cognome' sia 'Sormani' nell'oggetto venditore dalla tua API.
    const isSormaniGaetano = selectedVenditore && selectedVenditore.nome === 'Gaetano' && selectedVenditore.cognome === 'Sormani';
    const isSormaniFrancesco = selectedVenditore && selectedVenditore.nome === 'Francesco' && selectedVenditore.cognome === 'Sormani';
    
    const isSormani = isSormaniGaetano || isSormaniFrancesco;

    if (isSormani) {
      // Se è Sormani, abilita la selezione del cliente
      setIsClienteSelectDisabled(false);
      // Convertiamo clienteSelezionato a numero per il confronto con gli ID interi dei clienti
      const currentSelectedClientId = parseInt(clienteSelezionato, 10);
      const selectedClient = clienti.find(c => (c._id || c.id) === currentSelectedClientId);

      if (selectedClient) {
        // Se il cliente è selezionato, precompila l'indirizzo
        setIndirizzo(selectedClient.indirizzo || '');
        setIndirizzoShouldBePrepopulated(true); // L'indirizzo deve essere bloccato
      } else {
        // Se il cliente non è ancora selezionato, l'indirizzo rimane vuoto ma bloccato se Sormani è selezionato
        setIndirizzo('');
        setIndirizzoShouldBePrepopulated(true); // L'indirizzo è bloccato in attesa della selezione del cliente
      }
    } else {
      // Se non è Sormani (o nessun venditore selezionato), disabilita la selezione del cliente
      setIsClienteSelectDisabled(true);
      setClienteSelezionato(''); // Resetta la selezione del cliente
      setIndirizzo(''); // Svuota l'indirizzo
      setIndirizzoShouldBePrepopulated(false); // L'indirizzo è modificabile manualmente
    }
  }, [venditoreSelezionato, clienteSelezionato, venditori, clienti]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!venditoreSelezionato) {
      setMessage('Errore: Seleziona un venditore.');
      return;
    }
    
    // Aggiungi validazione per il cliente solo se il select non è disabilitato
    if (!isClienteSelectDisabled && !clienteSelezionato) {
      setMessage('Errore: Seleziona un cliente.');
      return;
    }

    if (!indirizzo || !tipologia || importo === '' || giorniLavorativiStimati === '') {
      setMessage('Errore: Compila tutti i campi obbligatori.');
      return;
    }
    if (parseFloat(importo) <= 0) {
        setMessage('Errore: L\'importo deve essere maggiore di zero.');
        return;
    }
    if (parseInt(giorniLavorativiStimati, 10) <= 0) {
        setMessage('Errore: I giorni lavorativi stimati devono essere maggiori di zero.');
        return;
    }

    try {
      const response = await fetch('/api/montaggi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indirizzo,
          tipologia,
          importo: parseFloat(importo),
          giorni_lavorativi_stimati: parseInt(giorniLavorativiStimati, 10),
          data_inizio_stimata: dataInizioStimata || null,
          // Assicurati che gli ID inviati al backend siano numeri interi se il tuo schema li richiede come tali
          venditoreId: parseInt(venditoreSelezionato, 10),
          clienteId: isClienteSelectDisabled ? null : parseInt(clienteSelezionato, 10), 
        }),
      });

      if (response.ok) {
        setMessage('Montaggio creato con successo!');
        // Resetta i campi del form
        setIndirizzo('');
        setTipologia('');
        setImporto('');
        setGiorniLavorativiStimati('');
        setDataInizioStimata('');
        setVenditoreSelezionato('');
        setClienteSelezionato('');
        setIndirizzoShouldBePrepopulated(false); // Reset dello stato di precompilazione
        setIsClienteSelectDisabled(true); // Reset disabilitazione cliente
      } else {
        const errorData = await response.json();
        setMessage(
          `Errore nella creazione del montaggio: ${errorData.error || "Impossibile creare il montaggio."}`
        );
      }
    } catch (error) {
      setMessage(`Errore di rete: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Crea Nuovo Montaggio</h1>
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
          <h2 className={styles.sectionTitle}>Assegnazione</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="venditore">Venditore</label>
              <select
                id="venditore"
                value={venditoreSelezionato}
                onChange={(e) => setVenditoreSelezionato(e.target.value)}
                required
              >
                <option value="">Seleziona un venditore</option>
                {/* Assicurati che il value sia un numero se l'ID è numerico */}
                {venditori.map((venditore) => (
                  <option key={venditore._id || venditore.id} value={venditore._id || venditore.id}>
                    {venditore.nome} {venditore.cognome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cliente">Cliente</label>
              <select
                id="cliente"
                value={clienteSelezionato}
                onChange={(e) => setClienteSelezionato(e.target.value)}
                required={!isClienteSelectDisabled}
                disabled={isClienteSelectDisabled}
                className={isClienteSelectDisabled ? styles.disabledSelect : ''}
              >
                <option value="">Seleziona un cliente</option>
                {/* Assicurati che il value sia un numero se l'ID è numerico */}
                {clienti.map((cliente) => (
                  <option key={cliente._id || cliente.id} value={cliente._id || cliente.id}>
                    {cliente.nome} {cliente.cognome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Dettagli Montaggio</h2>

          <div className={styles.formGroup}>
            <label htmlFor="indirizzo">Indirizzo del Montaggio</label>
            <input
              type="text"
              id="indirizzo"
              value={indirizzo}
              onChange={(e) => {
                if (!indirizzoShouldBePrepopulated) {
                  setIndirizzo(e.target.value);
                }
              }}
              required
              placeholder="Via Roma 1, Milano"
              readOnly={indirizzoShouldBePrepopulated}
              className={indirizzoShouldBePrepopulated ? styles.readOnlyInput : ''}
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="tipologia">Tipologia</label>
              <select
                id="tipologia"
                value={tipologia}
                onChange={(e) => setTipologia(e.target.value)}
                required
              >
                <option value="">Seleziona tipologia</option>
                <option value="cucina">Cucina</option>
                <option value="armadio">Armadio</option>
                <option value="cameretta">Cameretta</option>
                <option value="altro">Altro</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="importo">Importo Montaggio (€)</label>
              <div className={styles.currencyInput}>
                <span>€</span>
                <input
                  type="number"
                  id="importo"
                  value={importo}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setImporto(val < 0 ? '0' : e.target.value);
                    else setImporto('');
                  }}
                  required
                  min="0"
                  step="50"
                  placeholder="500.00"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="giorniLavorativiStimati">Giorni Lavorativi Stimati</label>
              <input
                type="number"
                id="giorniLavorativiStimati"
                value={giorniLavorativiStimati}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setGiorniLavorativiStimati(val < 0 ? '0' : e.target.value);
                  else setGiorniLavorativiStimati('');
                }}
                required
                min="0"
                step="1"
                placeholder="2"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dataInizioStimata">Data Inizio Stimata</label>
              <input
                type="date"
                id="dataInizioStimata"
                value={dataInizioStimata}
                onChange={(e) => setDataInizioStimata(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton}>
            Crea Montaggio
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => {
            setIndirizzo('');
            setTipologia('');
            setImporto('');
            setGiorniLavorativiStimati('');
            setDataInizioStimata('');
            setVenditoreSelezionato('');
            setClienteSelezionato('');
            setIndirizzoShouldBePrepopulated(false);
            setIsClienteSelectDisabled(true);
            setMessage('');
          }}>
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateMontaggioForm;