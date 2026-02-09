// src/app/api/clients/route.js
import { NextResponse } from 'next/server';
import { openDb, all, exec } from '../../../lib/db'; // Assicurati di importare 'all'

export async function GET() {
  try {
    const db = await openDb();
    const clients = await all(db, 'SELECT id, nome, cognome, telefono, indirizzo, nazione FROM clienti');
    await db.close();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Errore durante il recupero dei clienti:', error);
    return NextResponse.json({ error: 'Impossibile recuperare i clienti.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome, cognome, telefono, indirizzo, nazione } = await request.json();

    if (!nome || !cognome) {
      return NextResponse.json({ error: 'Nome e cognome sono obbligatori.' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(
      db,
      'INSERT INTO clienti (nome, cognome, telefono, indirizzo, nazione) VALUES (?, ?, ?, ?, ?)',
      [nome, cognome, telefono, indirizzo, nazione]
    );
    await db.close();

    return NextResponse.json({
      id: result.lastID,
      nome,
      cognome,
      telefono,
      indirizzo,
      nazione
    }, { status: 201 });
  } catch (error) {
    console.error('Errore durante la creazione del cliente:', error);
    return NextResponse.json({ error: 'Impossibile creare il cliente.' }, { status: 500 });
  }
}

