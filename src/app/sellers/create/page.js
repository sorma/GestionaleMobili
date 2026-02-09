'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../../styles/form.module.css';
import ReactCountryFlag from 'react-country-flag';

const prefissiEuropei = [
  { label: 'Italia (+39)', value: '+39', code: 'IT', nazione: 'Italia' },
  { label: 'Germania (+49)', value: '+49', code: 'DE', nazione: 'Germania' },
  { label: 'Francia (+33)', value: '+33', code: 'FR', nazione: 'Francia' },
  { label: 'Spagna (+34)', value: '+34', code: 'ES', nazione: 'Spagna' },
  { label: 'Regno Unito (+44)', value: '+44', code: 'GB', nazione: 'Regno Unito' },
];

function CreateSellerForm() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [prefissoSelezionato, setPrefissoSelezionato] = useState('+39');
  const [nazioneSelezionata, setNazioneSelezionata] = useState('Italia');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [message, setMessage] = useState('');
  const [erroreNumero, setErroreNumero] = useState('');

  const handlePrefissoChange = (e) => {
    const selectedValue = e.target.value;
    setPrefissoSelezionato(selectedValue);
    const prefissoInfo = prefissiEuropei.find(p => p.value === selectedValue);
    setNazioneSelezionata(prefissoInfo ? prefissoInfo.nazione : '');
  };

  const handleNumeroTelefonoChange = (e) => {
    const value = e.target.value;
    if (/^[0-9\s]*$/.test(value)) {
      setNumeroTelefono(value);
      setErroreNumero('');
    } else {
      setErroreNumero('Inserisci solo numeri e spazi.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (erroreNumero) {
      setMessage('Correggi gli errori nel form.');
      return;
    }

    const numeroDaSalvare = numeroTelefono.replace(/\s/g, '');

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cognome,
          // MODIFICA QUI: inviamo solo il numero, senza il prefisso
          telefono: numeroDaSalvare,
          nazione: nazioneSelezionata,
          prefisso: prefissoSelezionato // Aggiungi questo se vuoi salvare il prefisso in un campo separato
        }),
      });

      if (response.ok) {
        setMessage('Venditore creato con successo!');
        setNome('');
        setCognome('');
        setPrefissoSelezionato('+39');
        setNazioneSelezionata('Italia');
        setNumeroTelefono('');
        setErroreNumero(''); // Reset dell'errore anche al successo
      } else {
        const errorData = await response.json();
        setMessage(`Errore: ${errorData.error || 'Impossibile creare il venditore'}`);
      }
    } catch (error) {
      setMessage(`Errore di rete: ${error.message}`);
    }
  };

  const getFlagCode = (prefisso) => {
    const paese = prefissiEuropei.find(p => p.value === prefisso);
    return paese ? paese.code : 'IT';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Crea Nuovo Venditore</h1>
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
          <h2 className={styles.sectionTitle}>Informazioni Personali</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cognome">Cognome</label>
              <input
                type="text"
                id="cognome"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Contatti</h2>

          <div className={styles.formGroup}>
            <label>Numero di Telefono</label>
            <div className={styles.phoneInputGroup}>
              <div className={styles.phonePrefix}>
                <ReactCountryFlag
                  countryCode={getFlagCode(prefissoSelezionato)}
                  svg
                  style={{ width: '1.5em', height: '1.5em' }}
                  title={nazioneSelezionata}
                />
                <select
                  value={prefissoSelezionato}
                  onChange={handlePrefissoChange}
                  className={styles.phonePrefixSelect}
                >
                  {prefissiEuropei.map((prefisso) => (
                    <option key={prefisso.value} value={prefisso.value}>
                      {prefisso.value}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={numeroTelefono}
                onChange={handleNumeroTelefonoChange}
                placeholder="Numero"
                className={styles.phoneNumberInput}
              />
            </div>
            {erroreNumero && <p className={styles.inputError}>{erroreNumero}</p>}
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton}>
            Crea Venditore
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setNome('');
              setCognome('');
              setPrefissoSelezionato('+39');
              setNazioneSelezionata('Italia');
              setNumeroTelefono('');
              setMessage('');
              setErroreNumero('');
            }}
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSellerForm;