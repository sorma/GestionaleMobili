import { openDb, all, exec } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  try {
    const rows = await all(
      db,
      `
      SELECT id, macro_categoria, tipo_pezzo, quantita, unita, riferimento_lavoro, data_inserimento
      FROM magazzino
      ORDER BY id DESC
      `
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}

export async function POST(req) {
  const db = await openDb();
  try {
    const body = await req.json();
    const { macro_categoria, tipo_pezzo, quantita, riferimento_lavoro } = body || {};

    if (!macro_categoria || !tipo_pezzo || quantita === undefined || quantita === null) {
      return Response.json({ error: "Campi obbligatori mancanti." }, { status: 400 });
    }

    const q = Number(quantita);
    if (!Number.isFinite(q) || q < 0) {
      return Response.json({ error: "Quantità non valida." }, { status: 400 });
    }

    const result = await exec(
      db,
      `
      INSERT INTO magazzino (macro_categoria, tipo_pezzo, quantita, unita, riferimento_lavoro)
      VALUES (?, ?, ?, 'pz', ?)
      `,
      [macro_categoria, tipo_pezzo, Math.trunc(q), riferimento_lavoro || null]
    );

    return Response.json({ ok: true, id: result.lastID });
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}
