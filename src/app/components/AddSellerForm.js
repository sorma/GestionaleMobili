'use client';
import React, { useState } from 'react';

function AddSellerForm() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, cognome }),
      });

      if (response.ok) {
        setMessage('Venditore aggiunto con successo!');
        setNome('');
        setCognome('');
        // Potremmo anche ricaricare l'elenco dei venditori qui
      } else {
        const errorData = await response.json();
        setMessage(`Errore nell'aggiunta del venditore: ${errorData.error || 'Impossibile aggiungere il venditore.'}`);
      }
    } catch (error) {
      setMessage(`Errore di rete: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Aggiungi un nuovo venditore</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cognome">Cognome:</label>
          <input
            type="text"
            id="cognome"
            value={cognome}
            onChange={(e) => setCognome(e.target.value)}
            required
          />
        </div>
        <button type="submit">Aggiungi Venditore</button>
      </form>
    </div>
  );
}

export default AddSellerForm;