// src/app/api/clients/[id]/route.js
import { NextResponse } from 'next/server';
import { openDb, exec } from '../../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Aggiunto await per i parametri

    if (!id) {
      return NextResponse.json({ error: 'ID del cliente non fornito.' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(db, 'DELETE FROM clienti WHERE id = ?', [id]);
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Cliente non trovato o già eliminato.' }, { status: 404 });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del cliente:', error);
    return NextResponse.json({ error: 'Impossibile eliminare il cliente.' }, { status: 500 });
  }
}