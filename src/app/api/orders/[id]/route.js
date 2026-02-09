// src/app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { openDb, exec } from '../../../../lib/db';

// DELETE un singolo ordine
export async function DELETE(request, { params }) {
  try {
    // Aggiungi await prima di destrutturare params
    const { id } = await params; // Nota l'await qui

    if (!id) {
      return NextResponse.json({ error: 'ID ordine non fornito.' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(db, 'DELETE FROM ordini WHERE id = ?', [id]);
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Ordine non trovato o già eliminato.' }, { status: 404 });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'ordine:', error);
    return NextResponse.json({ error: 'Impossibile eliminare l\'ordine.' }, { status: 500 });
  }
}

// PUT per aggiornare un ordine (es. lo stato)
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Aggiungi await anche qui
    
    const { stato } = await request.json();

    if (!id || !stato) {
      return NextResponse.json({ error: 'ID ordine e stato sono richiesti.' }, { status: 400 });
    }

    const db = await openDb();
    const result = await exec(db, 'UPDATE ordini SET stato = ? WHERE id = ?', [stato, id]);
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Ordine non trovato o stato già aggiornato.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Stato ordine aggiornato con successo.', id, stato }, { status: 200 });
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'ordine:", error);
    return NextResponse.json({ error: "Impossibile aggiornare l'ordine." }, { status: 500 });
  }
}