import { openDb, exec, get, all } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  try {
    const rows = await all(
      db,
      `SELECT 
         a.id,
         a.data_ora,
         a.client_id,
         a.telefono,
         (c.nome || ' ' || c.cognome) AS cliente_nome
       FROM appuntamenti a
       JOIN clienti c ON c.id = a.client_id
       ORDER BY a.data_ora ASC`
    );

    return Response.json(Array.isArray(rows) ? rows : []);
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  const clientId = Number(body?.client_id);
  const dataOraRaw = String(body?.data_ora || "").trim();

  if (!Number.isFinite(clientId)) {
    return Response.json({ error: "Cliente non valido." }, { status: 400 });
  }
  if (!dataOraRaw) {
    return Response.json({ error: "Data/ora obbligatoria." }, { status: 400 });
  }

  const d = new Date(dataOraRaw);
  if (Number.isNaN(d.getTime())) {
    return Response.json({ error: "Data/ora non valida." }, { status: 400 });
  }
  const iso = d.toISOString();

  const db = await openDb();
  try {
    // Telefono preso DAL CLIENTE (fonte unica)
    const client = await get(
      db,
      `SELECT id, telefono, nome, cognome
       FROM clienti
       WHERE id = ?`,
      [clientId]
    );

    if (!client) {
      return Response.json({ error: "Cliente non trovato." }, { status: 404 });
    }

    const telefono = String(client.telefono || "").trim();
    if (!telefono) {
      return Response.json(
        { error: "Il cliente selezionato non ha un telefono salvato." },
        { status: 409 }
      );
    }

    await exec(
      db,
      `INSERT INTO appuntamenti (data_ora, client_id, telefono)
       VALUES (?, ?, ?)`,
      [iso, clientId, telefono]
    );

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e?.message || "Errore DB" }, { status: 500 });
  } finally {
    db.close();
  }
}
