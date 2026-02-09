// src/app/api/montaggi/[id]/route.js
import { NextResponse } from 'next/server';
import { openDb, exec } from '../../../../lib/db'; // Usiamo 'exec' per le query di scrittura

export async function DELETE(request, { params }) {
  const { id } = await params;; // Estrae l'ID dalla URL dinamica

  if (!id) {
    return NextResponse.json({ error: 'ID del montaggio non fornito.' }, { status: 400 });
  }

  try {
    const db = await openDb();
    const result = await exec(db, 'DELETE FROM montaggi WHERE id = ?', [id]);
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Montaggio non trovato o già eliminato.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Montaggio eliminato con successo.' }, { status: 200 });
  } catch (error) {
    console.error(`Errore nell'eliminazione del montaggio ${id}:`, error);
    return NextResponse.json({ error: `Errore interno del server durante l'eliminazione del montaggio.` }, { status: 500 });
  }
}