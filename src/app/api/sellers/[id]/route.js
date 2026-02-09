import { NextResponse } from 'next/server';
import { openDb, exec, get } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Aggiunto await

    const db = await openDb();
    const seller = await get(db, 'SELECT id, nome, cognome, telefono FROM venditori WHERE id = ?', [id]);
    await db.close();

    if (!seller) {
      return NextResponse.json({ error: `Venditore con ID ${id} non trovato` }, { status: 404 });
    }

    return NextResponse.json(seller, { status: 200 });
  } catch (error) {
    console.error(`Errore durante la lettura del venditore con ID ${id}:`, error);
    return NextResponse.json({ error: 'Impossibile recuperare il venditore' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {  // Cambiato da context a { params }
  try {
    const { id } = await params; // Aggiunto await

    const db = await openDb();
    const result = await exec(db, 'DELETE FROM venditori WHERE id = ?', [id]);
    await db.close();

    if (result.changes > 0) {
      return NextResponse.json({ message: `Venditore con ID ${id} eliminato con successo` }, { status: 200 });
    } else {
      return NextResponse.json({ error: `Venditore con ID ${id} non trovato` }, { status: 404 });
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione del venditore:", error);
    return NextResponse.json({ error: 'Impossibile eliminare il venditore' }, { status: 500 });
  }
}