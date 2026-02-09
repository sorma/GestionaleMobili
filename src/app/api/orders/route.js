// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { openDb, exec, all, get } from '../../../lib/db';

// GET di tutti gli ordini (con i nomi di venditore, cliente e lo stato)
export async function GET() {
  let db; // Dichiara db fuori dal try
  try {
    db = await openDb();
    const orders = await all(db, `
      SELECT
        o.id,
        o.data_ordine,
        o.totale,
        o.numero_colli,
        o.destinazione,
        o.stato,
        v.nome AS venditore_nome,
        v.cognome AS venditore_cognome,
        c.nome AS cliente_nome,
        c.cognome AS cliente_cognome
      FROM ordini o
      JOIN venditori v ON o.venditore_id = v.id
      JOIN clienti c ON o.cliente_id = c.id
      ORDER BY o.data_ordine DESC, o.id DESC
    `);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Errore durante il recupero degli ordini:', error);
    return NextResponse.json({ error: 'Impossibile recuperare gli ordini.' }, { status: 500 });
  } finally {
    if (db) { // Chiudi solo se il database è stato aperto con successo
      await db.close();
    }
  }
}

// POST di un nuovo ordine
export async function POST(request) {
  let db; // Dichiara db fuori dal try
  try {
    const { venditore_id, cliente_id, data_ordine, totale, numero_colli, destinazione } = await request.json();

    if (!venditore_id || !cliente_id || !data_ordine || totale === undefined || numero_colli === undefined || !destinazione) {
      return NextResponse.json({ error: 'Tutti i campi obbligatori (venditore, cliente, data, totale, colli, destinazione) sono richiesti.' }, { status: 400 });
    }

    db = await openDb();

    // Verificare che venditore_id e cliente_id esistano
    const venditoreExists = await get(db, 'SELECT id FROM venditori WHERE id = ?', [venditore_id]);
    const clienteExists = await get(db, 'SELECT id FROM clienti WHERE id = ?', [cliente_id]);

    if (!venditoreExists) {
      return NextResponse.json({ error: 'Venditore non trovato.' }, { status: 404 });
    }
    if (!clienteExists) {
      return NextResponse.json({ error: 'Cliente non trovato.' }, { status: 404 });
    }

    // Inseriamo l'ordine; la colonna 'stato' userà il suo valore DEFAULT
    const result = await exec(
      db,
      'INSERT INTO ordini (venditore_id, cliente_id, data_ordine, totale, numero_colli, destinazione) VALUES (?, ?, ?, ?, ?, ?)',
      [venditore_id, cliente_id, data_ordine, totale, numero_colli, destinazione]
    );

    // Per completezza, recuperiamo l'ordine appena creato con il suo stato di default
    // Questo è utile se il frontend ha bisogno di sapere lo stato iniziale
    const newOrder = await get(db, 'SELECT * FROM ordini WHERE id = ?', [result.lastID]);


    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Errore durante la creazione dell\'ordine:', error);
    return NextResponse.json({ error: 'Impossibile creare l\'ordine.' }, { status: 500 });
  } finally {
    if (db) {
      await db.close(); // Chiudi la connessione qui, una sola volta
    }
  }
}
