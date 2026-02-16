import { NextResponse } from "next/server";
import { openDb, all, exec } from "../../../lib/db";

export const runtime = "nodejs";

const TIPOLOGIE = [
  "Benzina",
  "Gomme",
  "Tagliando",
  "Revisione",
  "Assicurazione",
  "Ferramenta",
  "Danno",
  "Manodopera",
  "Attrezzatura",
];

export async function GET() {
  let db;
  try {
    db = await openDb();
    const rows = await all(
      db,
      `SELECT id, tipologia, data, prezzo
       FROM costi
       ORDER BY data DESC, id DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Errore GET /api/costi:", error);
    return NextResponse.json({ error: "Impossibile recuperare i costi." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}

export async function POST(request) {
  let db;
  try {
    const body = await request.json().catch(() => ({}));
    const tipologia = String(body.tipologia || "").trim();
    const data = String(body.data || "").trim(); // YYYY-MM-DD
    const prezzoNum = Number(body.prezzo);

    if (!tipologia || !TIPOLOGIE.includes(tipologia)) {
      return NextResponse.json({ error: "Tipologia non valida." }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "Data obbligatoria." }, { status: 400 });
    }
    if (Number.isNaN(prezzoNum) || prezzoNum <= 0) {
      return NextResponse.json({ error: "Prezzo non valido." }, { status: 400 });
    }

    db = await openDb();
    const result = await exec(
      db,
      `INSERT INTO costi (tipologia, data, prezzo) VALUES (?, ?, ?)`,
      [tipologia, data, prezzoNum]
    );

    return NextResponse.json(
      { id: result.lastID, tipologia, data, prezzo: prezzoNum },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore POST /api/costi:", error);
    return NextResponse.json({ error: "Impossibile creare il costo." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
