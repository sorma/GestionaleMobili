import { openDb, exec, get } from "@/lib/db";

export async function PATCH(req, context) {
  const { id } = await context.params;
  const numericId = Number(id);

  const body = await req.json().catch(() => ({}));
  const qty = Number(body?.quantita);
  const action = String(body?.action || "scarico"); // "scarico" | "carico"

  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "ID non valido." }, { status: 400 });
  }

  if (!Number.isFinite(qty) || qty <= 0) {
    return Response.json({ error: "Quantità non valida." }, { status: 400 });
  }

  if (action !== "scarico" && action !== "carico") {
    return Response.json({ error: "Azione non valida." }, { status: 400 });
  }

  const q = Math.trunc(qty);

  const db = await openDb();
  try {
    // Verifica esistenza riga (utile sia per carico che per scarico)
    const exists = await get(db, `SELECT id, quantita FROM magazzino WHERE id = ?`, [numericId]);
    if (!exists) {
      return Response.json({ error: "Riga non trovata." }, { status: 404 });
    }

    if (action === "carico") {
      // Incremento quantità
      const upd = await exec(
        db,
        `UPDATE magazzino
         SET quantita = quantita + ?
         WHERE id = ?`,
        [q, numericId]
      );

      if (!upd?.changes) {
        return Response.json({ error: "Aggiornamento non riuscito." }, { status: 500 });
      }

      const updated = await get(
        db,
        `SELECT id, macro_categoria, tipo_pezzo, quantita, unita, riferimento_lavoro, data_inserimento
         FROM magazzino WHERE id = ?`,
        [numericId]
      );

      return Response.json({ ok: true, row: updated });
    }

    // action === "scarico" (decremento con vincolo disponibilità)
    const upd = await exec(
      db,
      `UPDATE magazzino
       SET quantita = quantita - ?
       WHERE id = ? AND quantita >= ?`,
      [q, numericId, q]
    );

    if (!upd?.changes) {
      const row = await get(db, `SELECT quantita FROM magazzino WHERE id = ?`, [numericId]);
      if (!row) return Response.json({ error: "Riga non trovata." }, { status: 404 });

      return Response.json(
        { error: `Disponibilità insufficiente. Disponibili: ${row.quantita}` },
        { status: 409 }
      );
    }

    const after = await get(db, `SELECT quantita FROM magazzino WHERE id = ?`, [numericId]);

    if (after && Number(after.quantita) === 0) {
      await exec(db, `DELETE FROM magazzino WHERE id = ?`, [numericId]);
      return Response.json({ ok: true, deleted: true });
    }

    const updated = await get(
      db,
      `SELECT id, macro_categoria, tipo_pezzo, quantita, unita, riferimento_lavoro, data_inserimento
       FROM magazzino WHERE id = ?`,
      [numericId]
    );

    return Response.json({ ok: true, row: updated });
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}
