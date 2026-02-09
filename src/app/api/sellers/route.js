import { NextResponse } from 'next/server';
import { openDb, exec, all } from '../../../lib/db'; // Importa anche la funzione all

export async function GET() {
  try {
    const db = await openDb();
    const sellers = await all(db, 'SELECT id, nome, cognome, telefono, nazione FROM venditori'); // Includi la nazione
    await db.close();
    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Errore durante la lettura dei venditori:', error);
    return NextResponse.json({ error: 'Impossibile recuperare i venditori' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome, cognome, telefono, nazione } = await request.json();

    if (!nome || !cognome) {
      return NextResponse.json({ error: 'Nome e cognome sono obbligatori' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(
      db,
      'INSERT INTO venditori (nome, cognome, telefono, nazione) VALUES (?, ?, ?, ?)', // Inserisci anche la nazione
      [nome, cognome, telefono, nazione]
    );
    await db.close();

    return NextResponse.json({ id: result.lastID, nome, cognome, telefono, nazione }, { status: 201 });
  } catch (error) {
    console.error('Errore durante la creazione del venditore:', error);
    return NextResponse.json({ error: 'Impossibile creare il venditore' }, { status: 500 });
  }
}
