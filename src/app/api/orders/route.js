// src/app/api/orders/route.js
import { NextResponse } from "next/server";
import { openDb, exec, all, get } from "../../../lib/db";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

// GET
export async function GET() {
  let db;
  try {
    db = await openDb();

    const orders = await all(
      db,
      `
      SELECT
        o.id,
        o.data_ordine,
        o.costo,
        o.preventivo,
        o.numero_colli,
        o.destinazione,
        o.stato,
        o.disegno_path,
        v.nome AS venditore_nome,
        v.cognome AS venditore_cognome,
        c.nome AS cliente_nome,
        c.cognome AS cliente_cognome
      FROM ordini o
      JOIN venditori v ON o.venditore_id = v.id
      JOIN clienti c ON o.cliente_id = c.id
      ORDER BY o.data_ordine DESC, o.id DESC
      `
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Errore durante il recupero degli ordini:", error);
    return NextResponse.json(
      { error: "Impossibile recuperare gli ordini." },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

// POST
export async function POST(request) {
  let db;
  try {
    const form = await request.formData(); // formData nei route handlers [web:68]

    const venditore_id = form.get("venditore_id");
    const cliente_id = form.get("cliente_id");
    const data_ordine = form.get("data_ordine");
    const costo = form.get("costo");
    const preventivo = form.get("preventivo");
    const numero_colli = form.get("numero_colli");
    const destinazione = form.get("destinazione");
    const disegno = form.get("disegno");

    if (
      !venditore_id ||
      !cliente_id ||
      !data_ordine ||
      costo === undefined ||
      costo === null ||
      numero_colli === undefined ||
      numero_colli === null ||
      !destinazione
    ) {
      return NextResponse.json(
        {
          error:
            "Tutti i campi obbligatori (venditore, cliente, data, costo, colli, destinazione) sono richiesti.",
        },
        { status: 400 }
      );
    }

    const tot = Number(costo);
    const colli = Number(numero_colli);

    const prev =
      preventivo === undefined || preventivo === null || preventivo === ""
        ? null
        : Number(preventivo);

    if (Number.isNaN(tot) || tot < 0) {
      return NextResponse.json({ error: "Costo non valido (>= 0)." }, { status: 400 });
    }
    if (Number.isNaN(colli) || colli < 0) {
      return NextResponse.json({ error: "Numero colli non valido (>= 0)." }, { status: 400 });
    }
    if (prev !== null && (Number.isNaN(prev) || prev < 0)) {
      return NextResponse.json(
        { error: "Preventivo non valido (>= 0) oppure vuoto." },
        { status: 400 }
      );
    }

    let disegno_path = null;
    if (disegno && typeof disegno.arrayBuffer === "function") {
      if (disegno.type && !String(disegno.type).startsWith("image/")) {
        return NextResponse.json(
          { error: "Il file caricato deve essere un'immagine." },
          { status: 400 }
        );
      }

      const bytes = await disegno.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "ordini");
      await fs.mkdir(uploadDir, { recursive: true });

      const original = String(disegno.name || "disegno");
      const safeOriginal = original.replace(/[^\w.\-]+/g, "_");
      const filename = `${Date.now()}-${safeOriginal}`;

      await fs.writeFile(path.join(uploadDir, filename), buffer);

      disegno_path = `/uploads/ordini/${filename}`;
    }

    db = await openDb();

    const venditoreExists = await get(db, "SELECT id FROM venditori WHERE id = ?", [
      venditore_id,
    ]);
    const clienteExists = await get(db, "SELECT id FROM clienti WHERE id = ?", [
      cliente_id,
    ]);

    if (!venditoreExists) {
      return NextResponse.json({ error: "Venditore non trovato." }, { status: 404 });
    }
    if (!clienteExists) {
      return NextResponse.json({ error: "Cliente non trovato." }, { status: 404 });
    }

    const result = await exec(
      db,
      "INSERT INTO ordini (venditore_id, cliente_id, data_ordine, costo, preventivo, numero_colli, destinazione, disegno_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [venditore_id, cliente_id, data_ordine, tot, prev, colli, destinazione, disegno_path]
    );

    const newOrder = await get(db, "SELECT * FROM ordini WHERE id = ?", [result.lastID]);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Errore durante la creazione dell'ordine:", error);
    return NextResponse.json({ error: "Impossibile creare l'ordine." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
