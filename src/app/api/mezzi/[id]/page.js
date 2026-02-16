// src/app/api/mezzi/[id]/route.js
import { NextResponse } from "next/server";
import { openDb, exec, get } from "../../../../lib/db";

export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  let db;
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID non valido." }, { status: 400 });
    }

    db = await openDb();

    const exists = await get(db, "SELECT id FROM mezzi WHERE id = ?", [id]);
    if (!exists) {
      return NextResponse.json({ error: "Mezzo non trovato." }, { status: 404 });
    }

    await exec(db, "DELETE FROM mezzi WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore durante l'eliminazione del mezzo:", error);
    return NextResponse.json({ error: "Impossibile eliminare il mezzo." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
