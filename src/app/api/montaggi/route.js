// src/app/api/montaggi/route.js
import { NextResponse } from 'next/server';
import { openDb, exec, all } from '../../../lib/db';

export async function POST(request) {
  try {
    const { indirizzo, tipologia, importo, giorni_lavorativi_stimati, data_inizio_stimata, venditoreId, clienteId } = await request.json();

    if (!indirizzo || !tipologia || importo === undefined || giorni_lavorativi_stimati === undefined || !venditoreId || !clienteId) {
      return NextResponse.json({ error: 'Tutti i campi obbligatori (inclusi venditore e cliente) devono essere forniti.' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(
      db,
      `INSERT INTO montaggi (indirizzo, tipologia, importo, giorni_lavorativi_stimati, data_inizio_stimata, venditore_id, cliente_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [indirizzo, tipologia, importo, giorni_lavorativi_stimati, data_inizio_stimata || null, venditoreId, clienteId]
    );
    await db.close();

    return NextResponse.json({ id: result.lastID, message: 'Montaggio creato con successo!' }, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione del montaggio:', error);
    return NextResponse.json({ error: 'Errore interno del server nella creazione del montaggio.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await openDb();
    const montaggiRaw = await all(
      db,
      `SELECT
         m.id,
         m.indirizzo,
         m.tipologia,
         m.importo,
         m.giorni_lavorativi_stimati,
         m.data_inizio_stimata,
         m.venditore_id,
         m.cliente_id,
         s.nome AS venditore_nome,
         s.cognome AS venditore_cognome,
         c.nome AS cliente_nome,
         c.cognome AS cliente_cognome
       FROM montaggi AS m
       LEFT JOIN venditori AS s ON m.venditore_id = s.id -- Modificato da 'sellers' a 'venditori'
       LEFT JOIN clienti AS c ON m.cliente_id = c.id
       ORDER BY m.id DESC`
    );
    await db.close();

    const montaggiFormatted = montaggiRaw.map(row => ({
      id: row.id,
      indirizzo: row.indirizzo,
      tipologia: row.tipologia,
      importo: row.importo,
      giorni_lavorativi_stimati: row.giorni_lavorativi_stimati,
      data_inizio_stimata: row.data_inizio_stimata,
      venditoreId: row.venditore_id,
      clienteId: row.cliente_id,
      venditore: row.venditore_id ? {
        id: row.venditore_id,
        nome: row.venditore_nome,
        cognome: row.venditore_cognome
      } : null,
      cliente: row.cliente_id ? {
        id: row.cliente_id,
        nome: row.cliente_nome,
        cognome: row.cliente_cognome
      } : null,
    }));

    return NextResponse.json(montaggiFormatted);
  } catch (error) {
    console.error('Errore nel recupero dei montaggi:', error);
    return NextResponse.json({ error: 'Errore nel recupero dei montaggi.' }, { status: 500 });
  }
}