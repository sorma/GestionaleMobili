import { openDb, exec, get } from "@/lib/db";

export async function DELETE(req, context) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "ID non valido." }, { status: 400 });
  }

  const db = await openDb();
  try {
    const exists = await get(db, `SELECT id FROM appuntamenti WHERE id = ?`, [numericId]);
    if (!exists) return Response.json({ error: "Appuntamento non trovato." }, { status: 404 });

    await exec(db, `DELETE FROM appuntamenti WHERE id = ?`, [numericId]);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}
